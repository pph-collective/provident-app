// env GOOGLE_APPLICATION_CREDENTIALS must contain the path to your firebase credentials
// usage: `node add-form.js -i form_id -f form.json`
const { ArgumentParser } = require("argparse");
const admin = require("firebase-admin");
const fs = require("fs");
const hash = require("object-hash");

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
  // assumes --emulator is the 5th arg
  console.log("using emulator");
  process.env.FIRESTORE_EMULATOR_HOST = "localhost:8088";
}
process.env.GOOGLE_APPLICATION_CREDENTIALS = "serviceAccount.json";

const app = admin.initializeApp();
const db = app.firestore();

const rawdata = fs.readFileSync(file);
let form = JSON.parse(rawdata);

const dateRegex = new RegExp("^[0-9]{4}-[0-9]{2}-[0-9]{2}$");

const warnAndExit = (warning) => {
  console.warn(warning);
  process.exit(1);
};

const validateForm = ({ title, type, questions, followup_form }) => {
  const warnings = {};

  // check title
  if (!title) {
    warnings.title = "Required field, a string";
  }

  // check type
  const validFormTypes = ["user", "organization"];
  if (!type) {
    warnings.type = "Required field, 'user' or 'organization'";
  } else if (!validFormTypes.includes(type)) {
    warnings.type = `Invalid form type entered: ${type}. Required field, 'user' or 'organization`;
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
  const sourceModels = sourceQuestions.map((q) => q.model);

  if (!followupForm["title"]) {
    warnings.title = "Required field, a string";
  }

  if (followupForm["type"]) {
    warnings.type =
      "Remove field, it gets overwritten to match the original form type";
  }

  if (!followupForm["date_count"]) {
    warnings.date_count = "Required field, integer.";
  }

  if (
    !followupForm["date_unit"] ||
    !["day", "week", "month"].includes(followupForm["date_unit"])
  ) {
    warnings.date_unit =
      "Required field, string. Must be either 'day', 'week', or 'month'.";
  }

  if (!followupForm["questions"]) {
    warnings.questions = "Required field, list of questions";
  } else {
    warnings.questions = {};

    Object.entries(followupForm["questions"]).forEach(([key, question]) => {
      let questionWarnings = {};
      if (question["source_model"]) {
        if (!sourceModels.includes(question["source_model"])) {
          questionWarnings[
            "source_model"
          ] = `model, '${question["source_model"]}', not found in the form this one follows`;
        }

        if (!question["label"]) {
          questionWarnings["label"] = "Required field, a string";
        }

        if (!question["model"]) {
          questionWarnings["model"] =
            "Required field, a string. This is the new model for the question.";
        }

        if (question["component"]) {
          questionWarnings["component"] =
            "Invalid field: source_model was provided. We'll pull the component field from the source_model question.";
        }
      } else if (question["model"]) {
        // Regular question
        questionWarnings = validateQuestion(question);
      } else {
        questionWarnings = "`source_model` or `model` fields are required";
      }
      warnings.questions[key] = questionWarnings;
    });
  }

  if (followupForm["followup_form"]) {
    warnings.followup_form = validateFollowupForm(
      followupForm["followup_form"],
      followupForm["questions"]
    );
  }

  return warnings;
};

const validateQuestion = (question) => {
  const warnings = {};

  // check label
  if (!question["label"]) {
    warnings["label"] = "Required field, a string for the question label";
  }

  if (question["source_model"]) {
    warnings["source_model"] =
      "Invalid field, source_model exists on followup_form questions only";
  }

  // check component
  if (!question["component"]) {
    warnings["component"] = "Required field";
  } else {
    switch (question["component"]) {
      case "Date":
        ["max_date", "min_date"].forEach((field) => {
          if (
            question[field] &&
            question[field] !== "today" &&
            !dateRegex.test(question[field])
          ) {
            warnings[field] =
              "Invalid value, should either be 'today' or in yyyy-mm-dd format";
          }
        });
        break;
      case "TextArea":
      case "TextInput":
        break;
      case "Select":
      case "Radio":
      case "Checkbox":
        if (!question["options"]) {
          warnings["options"] = "Required field, list of options";
        }
        break;
      case "LikertScale":
        if (!question["statements"]) {
          warnings["statements"] = "Required field, list of statements";
        }
        break;
      case "SubForm":
        if (!question["questions"]) {
          warnings["questions"] = "Required field, list of questions";
        } else {
          warnings.questions = validateQuestions(question["questions"]);
        }
        break;
      default:
        warnings[
          "component"
        ] = `Invalid component, must be of the following: Checkbox, Date, LikertScale, Radio, Select, SubForm, TextArea, TextInput`;
    }
  }

  return warnings;
};

const validateQuestions = (questions) => {
  const warnings = {};

  Object.entries(questions).forEach(([key, question]) => {
    warnings[key] = validateQuestion(question);
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
    db.collection("forms").doc(id).set(form);
  });
