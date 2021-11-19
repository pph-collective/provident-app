// env GOOGLE_APPLICATION_CREDENTIALS must contain the path to your firebase credentials
// usage: `node add-form.js form_id form.json`
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

const validateForm = (form) => {
  const warnings = {};

  // check title
  if (!form["title"]) {
    warnings.title = "Required field, a string";
  }

  // check type
  const validFormTypes = ["user", "organization"];
  if (!form["type"]) {
    warnings.type = "Required field, 'user' or 'organization'";
  } else if (!validFormTypes.includes(form["type"])) {
    warnings.type = `Invalid form type entered: ${form["type"]}. Required field, 'user' or 'organization`;
  }

  // check questions
  if (!form["questions"]) {
    warnings.questions = "Required field, list of questions";
  } else {
    const questionsWarnings = validateQuestions(form["questions"]);
    if (Object.keys(questionsWarnings).length > 0) {
      warnings.questions = questionsWarnings;
    }
  }

  if (form["followup_form"]) {
    const followupFormWarnings = validateFollowupForm(form["followup_form"]);

    if (Object.keys(followupFormWarnings).length > 0) {
      warnings.followup_form = followupFormWarnings;
    }
  }

  if (Object.keys(warnings).length > 0) {
    warnAndExit(JSON.stringify(warnings, null, 4));
  }
};

const validateFollowupForm = (followup_form) => {
  const warnings = {};

  if (!followup_form["title"]) {
    warnings.title = "Required field, a string";
  }

  if (followup_form["type"]) {
    warnings.type =
      "Remove field, it gets overwritten to match the original form type";
  }

  if (!followup_form["questions"]) {
    warnings.questions = "Required field, list of questions";
  } else {
    const questionsWarnings = {};

    Object.entries(followup_form["questions"]).forEach(([key, question]) => {
      let tempWarnings = {};
      if (question["source_model"]) {
        // TODO: source_model exists as model in regular form

        if (!question["label"]) {
          tempWarnings["label"] = "Required field, a string";
        }

        if (!question["model"]) {
          tempWarnings["model"] = "Required field, a string";
        }

        if (question["component"]) {
          tempWarnings["component"] =
            "Invalid field: source_model was provided. We'll pull the component field from the source_model question.";
        }
      } else {
        // Regular question
        tempWarnings = validateQuestion(question);
      }

      // Add warnings to
      if (Object.keys(tempWarnings).length > 0) {
        questionsWarnings[key] = tempWarnings;
      }
    });

    if (Object.keys(questionsWarnings).length > 0) {
      warnings.questions = questionsWarnings;
    }
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
          const subFormQuestionsWarnings = validateQuestions(
            question["questions"]
          );
          if (Object.keys(subFormQuestionsWarnings).length > 0) {
            warnings["questions"] = subFormQuestionsWarnings;
          }
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
    const questionWarnings = validateQuestion(question);

    if (Object.keys(questionWarnings).length > 0) {
      warnings[key] = questionWarnings;
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
