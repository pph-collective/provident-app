// env GOOGLE_APPLICATION_CREDENTIALS must contain the path to your firebase credentials
// usage: `node add-form.js -i form_id -f form.json`
const { ArgumentParser } = require("argparse");
const admin = require("firebase-admin");
const fs = require("fs");
const hash = require("object-hash");
const parseDuration = require("parse-duration");

const cloneDeep = (value) => JSON.parse(JSON.stringify(value));

const { default: Ajv } = require("ajv");
const ajv = new Ajv({ allErrors: true }); // Ajv option allErrors is required
require("ajv-errors")(ajv);

const parser = new ArgumentParser({
  description: "PROVIDENT - add/overwrite form",
  add_help: true,
});

parser.add_argument("-e", "--emulator", {
  action: "store_true",
  help: "upload form to the emulator instead of production DB",
});
parser.add_argument("-o", "--overwrite", {
  action: "store_true",
  help: "if the form already exists, overwrite it",
});
parser.add_argument("-f", "--file", {
  required: true,
  help: "Path to data file",
});
parser.add_argument("-i", "--id", {
  required: true,
  help: "ID of the form",
});

const { emulator, overwrite, id, file } = parser.parse_args();

if (emulator) {
  console.log("using emulator");
  process.env.FIRESTORE_EMULATOR_HOST = "localhost:8088";
}
process.env.GOOGLE_APPLICATION_CREDENTIALS = "serviceAccount.json";

const app = admin.initializeApp();
const db = app.firestore();

const rawdata = fs.readFileSync(file);
let form = JSON.parse(rawdata);

const dateRegex = "(^today$|^[0-9]{4}-[0-9]{2}-[0-9]{2}$)";

const warnAndExit = (warning) => {
  console.warn(warning);
  process.exit(1);
};

const validateForm = ({ title, type, questions, followup_form }) => {
  const warnings = {};

  // check title
  if (typeof title !== "string") {
    warnings.title = "Required field, a string";
  }

  // check type
  const validFormTypes = ["user", "organization"];
  if (!type) {
    warnings.type = "Required field, 'user' or 'organization'";
  } else if (!validFormTypes.includes(type)) {
    warnings.type = `Invalid form type entered: '${type}'. Required field, 'user' or 'organization'`;
  }

  // check questions
  if (!questions) {
    warnings.questions = "Required field, list of questions";
  } else {
    warnings.questions = validateQuestions(questions);
  }

  if (followup_form) {
    warnings.followup_form = validateFollowupForm(followup_form, questions);
  }

  deleteEmptyObjects(warnings);
  if (Object.keys(warnings).length > 0) {
    warnAndExit(JSON.stringify(warnings, null, 4));
  }
};

const validateFollowupForm = (followupForm, sourceQuestions) => {
  const warnings = {};

  if (!followupForm.title) {
    warnings.title = "Required field, a string";
  }

  if (followupForm.type) {
    warnings.type =
      "Remove field, it gets overwritten to match the original form type";
  }

  if (!followupForm.followup_interval) {
    warnings.followup_interval =
      "Required field. Ex. '3 months'. See https://github.com/jkroso/parse-duration for documentation";
  } else if (!parseDuration(followupForm.followup_interval)) {
    warnings.followup_interval =
      "Invalid value, unable to parse formatting. See https://github.com/jkroso/parse-duration for documentation";
  }

  if (!followupForm.questions) {
    warnings.questions = "Required field, list of questions";
  } else {
    warnings.questions = validateFollowupQuestions(
      sourceQuestions,
      followupForm.questions
    );
  }

  if (followupForm.followup_form) {
    warnings.followup_form = validateFollowupForm(
      followupForm.followup_form,
      followupForm.questions
    );
  }

  return warnings;
};

const validateFollowupQuestions = (sourceQuestions, followupQuestions) => {
  const warnings = [];
  const sourceModels = sourceQuestions.map((q) => q.model);

  Object.entries(followupQuestions).forEach(([key, question]) => {
    let questionWarnings = {};
    if (question.source_model) {
      if (!sourceModels.includes(question.source_model)) {
        questionWarnings.source_model = `model, '${question.source_model}', not found in parent form's list of models: ${sourceModels}`;
      }

      if (!question.label) {
        questionWarnings.label = "Required field, a string";
      }

      if (!question.model) {
        questionWarnings.model =
          "Required field, a string. This is the new model for the question.";
      }

      if (question.component) {
        questionWarnings.component =
          "Invalid field: source_model was provided. We'll pull the component field from the source_model question.";
      }

      // SubForm
      // We can't check directly that the component is a SubForm because followup questions that have a source_model
      // inherit the component rather than explicitly saying what it is.
      // However, we can check if the question has questions.
      if (question.questions) {
        const subForm = sourceQuestions.find(
          (q) => q.model === question.source_model
        );

        if (subForm) {
          const nestedQuestionsWarnings = validateFollowupQuestions(
            subForm.questions,
            question.questions
          );

          // If there are warnings append
          if (nestedQuestionsWarnings.length > 0) {
            questionWarnings.questions = nestedQuestionsWarnings;
          }
        } else {
          questionWarnings.questions = `Unable to find the source_model for the SubForm in the parent form: ${question.source_model}`;
        }
      }
    } else if (question.model) {
      // Regular question
      questionWarnings = validateQuestion(question);
    } else {
      questionWarnings = "`source_model` or `model` fields are required";
    }

    // Push to warnings
    if (Object.keys(questionWarnings).length > 0) {
      questionWarnings.question_number = key;

      // If there wasn't a warning on model, include model for reference
      if (!questionWarnings.model) {
        questionWarnings.model = question.model;
      }

      warnings.push(questionWarnings);
    }
  });

  return warnings;
};

const questionSchema = {
  type: "object",
  properties: {
    model: { type: "string" },
    label: { type: "string" },
    component: {
      type: "string",
      enum: [
        "Date",
        "TextArea",
        "TextInput",
        "Select",
        "Radio",
        "Checkbox",
        "LikertScale",
        "SubForm",
      ],
    },
    required: { type: "boolean" },
    help_text: { type: "string" },
    validations: { type: "string" },
    condition: { type: "string" },
    read_only: { type: "boolean" },
  },
  required: ["model", "label", "component"],
  additionalProperties: {
    not: true,
    errorMessage: "Invalid key",
  },
  errorMessage: {
    properties: {},
  },
};

const validateQuestion = (question) => {
  const warnings = {};
  const schema = cloneDeep(questionSchema);

  // check component
  if (question.component) {
    // Update the schema
    switch (question.component) {
      case "Date":
        schema.properties.min_date = { type: "string", pattern: dateRegex };
        schema.properties.max_date = { type: "string", pattern: dateRegex };
        schema.errorMessage.properties.min_date =
          "Invalid value, should either be 'today' or in yyyy-mm-dd format: ${/min_date}";
        schema.errorMessage.properties.max_date =
          "Invalid value, should either be 'today' or in yyyy-mm-dd format: ${/max_date}";
        break;
      case "TextArea":
        break;
      case "TextInput":
        schema.properties.type = {
          enum: [
            "text",
            "color",
            "date",
            "email",
            "month",
            "number",
            "password",
            "tel",
            "time",
            "url",
            "week",
          ],
        };
        break;
      case "Select":
      case "Radio":
      case "Checkbox":
        schema.properties.options = {
          type: "array",
          items: { type: "string" },
        };
        schema.required.push("options");
        break;
      case "LikertScale":
        schema.properties.statements = {
          type: "array",
          items: { type: "string" },
        };
        schema.required.push("statements");
        schema.properties.options = {
          type: "array",
          items: { type: "string" },
        };
        break;
      case "SubForm":
        schema.properties.questions = {
          type: "array",
          items: { type: "object" },
        };
        schema.required.push("questions");
        schema.properties.repeat_button_title = { type: "string" };

        if (question.questions !== undefined) {
          const nestedSubFormWarnings = validateQuestions(question.questions);

          // If there are warnings append
          if (nestedSubFormWarnings.length > 0) {
            warnings.questions = nestedSubFormWarnings;
          }
        }
        break;
    }
  }

  const validate = ajv.compile(schema);
  if (!validate(question)) {
    validate.errors.forEach((e) => {
      const key = e.instancePath.substring(1); // For example, "model", "component", that exist in our form
      if (key) {
        warnings[key] = e.message;
      } else {
        // The case in which we land here is when we are missing a required key.
        // The instancePath is an empty string, "". Since there is no instance of the key. Instead we use the keyword
        // from the error as the key. In this case "required".
        warnings[e.keyword] = e.message;
      }
    });
  }

  return warnings;
};

const validateQuestions = (questions) => {
  const warnings = [];

  Object.entries(questions).forEach(([key, question]) => {
    const questionWarnings = validateQuestion(question);

    if (Object.keys(questionWarnings).length > 0) {
      questionWarnings.question_number = key;

      // If there wasn't a warning on model, include model for reference
      if (!questionWarnings.model) {
        questionWarnings.model = question.model;
      }

      warnings.push(questionWarnings);
    }
  });

  return warnings;
};

// Add the timestamp of this upload as the form version
// This will be copied over to responses to more easily see if the questions change over time
// so that can be tracked for analysis
const addVersion = (oldForm, newForm) => {
  if (oldForm.version) {
    if (hash(oldForm.questions) !== hash(newForm.questions)) {
      form.version = Date.now();
    } else {
      console.log("form questions didn't change - keeping same version");
      form.version = oldForm.version;
    }
  } else {
    form.version = Date.now();
  }
};

function deleteEmptyObjects(obj) {
  for (const key in obj) {
    if (!obj[key] || typeof obj[key] !== "object") {
      continue;
    }

    deleteEmptyObjects(obj[key]);
    if (Object.keys(obj[key]).length === 0) {
      delete obj[key];
    }
  }
}

// check id isn't already in use
db.collection("forms")
  .doc(id)
  .get()
  .then((doc) => {
    let oldForm = {};
    if (doc.exists) {
      oldForm = doc.data();
      !overwrite && warnAndExit("Form with this ID already exists - aborting");
    }

    // validate the form and upload
    validateForm(form);
    addVersion(oldForm, form);
    // db.collection("forms").doc(id).set(form);
  });
