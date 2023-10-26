// env GOOGLE_APPLICATION_CREDENTIALS must contain the path to your firebase credentials
// usage: `node add-form.js -i form_id -f form.json`
const { ArgumentParser } = require("argparse");
const admin = require("firebase-admin");
const fs = require("fs");
const hash = require("object-hash");
const parseDuration = require("parse-duration");

const Ajv = require("ajv").default;
const ajv = new Ajv({
  allErrors: true, // Ajv option allErrors is required for ajv-errors
  allowUnionTypes: true,
});
require("ajv-errors")(ajv);

/**
 * PARSE COMMAND LINE ARGUMENTS
 */
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

/**
 * SCHEMAS
 */
const formSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    type: { enum: ["user", "organization"] },
    questions: {
      type: "array",
      items: { type: "object" },
    },
    followup_form: { type: "object" },
  },
  required: ["title", "type", "questions"],
  additionalProperties: {
    not: true,
    errorMessage: "Invalid key",
  },
  errorMessage: {
    properties: {},
  },
};

const followupFormSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    followup_interval: { type: "string" },
    questions: {
      type: "array",
      items: { type: "object" },
    },
    followup_form: { type: "object" },
  },
  required: ["title", "followup_interval", "questions"],
  additionalProperties: {
    not: true,
    errorMessage: "Invalid key",
  },
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
    read_only: { type: ["boolean", "string"] },
  },
  required: ["model", "label", "component"],
  additionalProperties: {
    not: true,
    errorMessage: "Invalid key",
  },
  errorMessage: {
    properties: {}, // Initializing here to edit for specific components
  },
};

const followupQuestionSchema = {
  type: "object",
  properties: {
    source_model: { type: "string" },
    model: { type: "string" },
    label: { type: "string" },
    questions: { type: "array", items: { type: "object" } },
    required: { type: "boolean" },
    help_text: { type: "string" },
    condition: { type: "string" },
    validations: { type: "string" },
    read_only: { type: ["boolean", "string"] },
    repeat_button_title: { type: "string" },
  },
  required: ["source_model", "model", "label"],
  additionalProperties: {
    not: true,
    errorMessage: "Invalid key",
  },
};

// Create question schemas

const dateRegex = "(^today$|^[0-9]{4}-[0-9]{2}-[0-9]{2}$)";
const componentToSchema = {
  Date: {
    properties: {
      min_date: { type: "string", pattern: dateRegex },
      max_date: { type: "string", pattern: dateRegex },
    },
    errorMessage: {
      properties: {
        min_date:
          "Invalid value, should either be 'today' or in yyyy-mm-dd format: ${/min_date}",
        max_date:
          "Invalid value, should either be 'today' or in yyyy-mm-dd format: ${/max_date}",
      },
    },
  },
  TextArea: {},
  TextInput: {
    properties: {
      type: {
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
      },
    },
  },
  Select: {
    properties: {
      options: { type: "array", items: { type: "string" } },
    },
    required: ["options"],
  },
  Radio: {
    properties: {
      options: { type: "array", items: { type: "string" } },
    },
    required: ["options"],
  },
  Checkbox: {
    properties: {
      options: { type: "array", items: { type: "string" } },
    },
    required: ["options"],
  },
  LikertScale: {
    properties: {
      statements: {
        type: "array",
        items: { type: "string" },
      },
      options: {
        type: "array",
        items: { type: "string" },
      },
    },
    required: ["statements"],
  },
  SubForm: {
    properties: {
      questions: {
        type: "array",
        items: { type: "object" },
      },
      repeat_button_title: { type: "string" },
    },
    required: ["questions"],
  },
};

/**
 * UTILITY FUNCTIONS
 */

/**
 * Identifies whether the parameter passed is an object
 *
 * @param {any} item
 * @returns {boolean}
 */
const isObject = (item) => {
  return item && typeof item === "object" && !Array.isArray(item);
};

/**
 * Deep merges javascript object. Whereas, Object.Assign or the spread operator only does a shallow merge.
 * Source: https://thewebdev.info/2021/03/06/how-to-deep-merge-javascript-objects/
 *
 * @param {Object} target - Object that is mutated through this merge
 * @param {Object} sources - Object to be merged into the target
 * @returns {Object}
 */
const mergeDeep = (target, ...sources) => {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key])
          Object.assign(target, {
            [key]: {},
          });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, {
          [key]: source[key],
        });
      }
    }
  }

  return mergeDeep(target, ...sources);
};

/**
 * Recursive function that removes empty objects inside of an object
 * Source: https://stackoverflow.com/questions/42736031/remove-empty-objects-from-an-object
 *
 * @param {Object} obj
 */
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

/**
 * Prints warning to the console and exits the script
 * @param {String} warning
 */
const warnAndExit = (warning) => {
  console.warn(warning);
  process.exit(1);
};

/**
 * VALIDATE FUNCTIONS
 */

/**
 * Uses ajv to validate the data with its appropriate schema
 *
 * @param {Object} schema
 * @param {Object} data
 * @returns {Object} warnings
 */
const validateSchema = (schema, data) => {
  const warnings = {};

  const validate = ajv.compile(schema);
  if (!validate(data)) {
    validate.errors.forEach((e) => {
      const key = e.instancePath.substring(1);
      warnings[key] = e.message;

      // Special messages
      if (e.params.allowedValues) {
        // For enum to show allowed values
        warnings[key] += `: ${e.params.allowedValues}`;
      }
    });
  }
  return warnings;
};

/**
 * Validates a question using the questionSchema. Then does special casing for a SubForm to recurse.
 *
 * @param question
 * @returns {Object} - warnings
 */
const validateQuestion = (question) => {
  const warnings = {};
  const { component, questions } = question;
  let schema = questionSchema;

  if (component) {
    // Get component specific schema
    if (componentToSchema[component]) {
      schema = componentToSchema[component];
    }

    // Special Cases
    if (component === "SubForm" && questions) {
      const nestedSubFormWarnings = validateQuestions(questions);

      // If there are warnings append
      if (nestedSubFormWarnings.length > 0) {
        warnings.questions = nestedSubFormWarnings;
      }
    }
  }

  return {
    ...validateSchema(schema, question),
    ...warnings,
  };
};

/**
 * Takes a list of questions, validates each question. If there are warnings from the question,
 * it adds the question number and model keys to warnings to help ground the user.
 *
 * @param {Object[]} questions
 * @returns {Array<Object>}
 */
const validateQuestions = (questions) => {
  const warnings = [];

  Object.entries(questions).forEach(([key, question]) => {
    const questionWarnings = validateQuestion(question);

    if (Object.keys(questionWarnings).length > 0) {
      warnings.push({
        question_number: key,
        model: question.model,
        ...questionWarnings,
      });
    }
  });

  return warnings;
};

/**
 * Validates followup questions with information from the source (parent) questions.
 *
 * In addition to the schema validation, there are special warnings for the following:
 *      - source_model doesn't exist in the sourceQuestions
 *      - recurse through a Subform
 *
 * @param {Array<Object>} sourceQuestions
 * @param {Array<Object>} followupQuestions
 * @returns {Array<Object>} warnings
 */
const validateFollowupQuestions = (sourceQuestions, followupQuestions) => {
  const warnings = [];
  const sourceModels = sourceQuestions.map((q) => q.model);

  Object.entries(followupQuestions).forEach(([key, question]) => {
    let questionWarnings = {};

    if (question.source_model) {
      questionWarnings = validateSchema(followupQuestionSchema, question);

      if (!sourceModels.includes(question.source_model)) {
        questionWarnings.source_model = `model, '${question.source_model}', not found in parent form's list of models: ${sourceModels}`;
      }

      // SubForm
      // We can't check directly that the component is a SubForm because followup questions that have a source_model
      // inherit the component rather than explicitly saying what it is.
      // However, we can check if the question has questions.
      if (question.questions) {
        const subForm = sourceQuestions.find(
          (q) => q.model === question.source_model,
        );

        if (subForm) {
          const nestedQuestionsWarnings = validateFollowupQuestions(
            subForm.questions,
            question.questions,
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
      questionWarnings["error"] = "`source_model` or `model` keys are required";
    }

    // Push to warnings
    if (Object.keys(questionWarnings).length > 0) {
      warnings.push({
        question_number: key,
        model: question.model,
        ...(question.source_model && { source_model: question.source_model }),
        ...questionWarnings,
      });
    }
  });

  return warnings;
};

/**
 * Validates the form.
 *
 * @param {Object} form
 */
const validateForm = (form) => {
  const warnings = validateSchema(formSchema, form);
  const { questions, followup_form } = form;

  if (questions) {
    warnings.questions = validateQuestions(questions);
  }

  if (followup_form) {
    warnings.followup_form = validateFollowupForm(followup_form, questions);
  }

  return warnings;
};

/**
 * Validates a followup form
 *
 * @param {Object} followupForm
 * @param {Array<Object>} sourceQuestions - source (parent) questions
 * @returns {Object} warnings
 */
const validateFollowupForm = (followupForm, sourceQuestions) => {
  const warnings = validateSchema(followupFormSchema, followupForm);

  if (
    followupForm.followup_interval &&
    !parseDuration(followupForm.followup_interval)
  ) {
    warnings.followup_interval =
      "Invalid value, unable to parse formatting. See https://github.com/jkroso/parse-duration for documentation";
  }

  if (followupForm.questions) {
    warnings.questions = validateFollowupQuestions(
      sourceQuestions,
      followupForm.questions,
    );
  }

  if (followupForm.followup_form) {
    warnings.followup_form = validateFollowupForm(
      followupForm.followup_form,
      followupForm.questions,
    );
  }

  return warnings;
};

/**
 * Adds the timestamp of this upload as the form version
 * This will be copied over to responses to more easily see if the questions change over time
 *  so that can be tracked for analysis
 * @param {Object} oldForm
 * @param {Object} newForm
 */
const addVersion = (oldForm, newForm) => {
  if (oldForm.version) {
    if (hash(oldForm.questions) !== hash(newForm.questions)) {
      form.version = Date.now();
    } else {
      console.log(
        "Form questions didn't change - keeping same version timestamp. This does not refer to followup form questions.",
      );
      form.version = oldForm.version;
    }
  } else {
    form.version = Date.now();
  }
};

/**
 * MAIN
 */
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

// merge question schema
for (const component in componentToSchema) {
  componentToSchema[component] = mergeDeep(
    componentToSchema[component],
    questionSchema,
  );
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
    const warnings = validateForm(form);
    deleteEmptyObjects(warnings);
    if (Object.keys(warnings).length > 0) {
      // Stringify warnings such that nested Objects and Arrays get printed rather than as '[Object]' and '[Array]'
      warnAndExit(JSON.stringify(warnings, null, 4));
    }

    addVersion(oldForm, form);
    db.collection("forms").doc(id).set(form);
  });
