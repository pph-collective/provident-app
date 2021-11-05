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
  // check title
  if (!form["title"]) {
    warnAndExit("must provide title");
  }

  // check type
  const validFormTypes = ["user", "organization"];
  if (!form["type"]) {
    warnAndExit("must provide a 'type'");
  } else if (!validFormTypes.includes(form["type"])) {
    warnAndExit(
      `invalid form type ${
        form["type"]
      }. valid form types: ${validFormTypes.join(", ")}`
    );
  }

  // check questions
  if (!form["questions"]) {
    warnAndExit("must provide questions");
  }

  validateQuestions(form["questions"]);
};

const validateQuestions = (questions) => {
  Object.entries(questions).forEach(([key, question]) => {
    // check label
    if (!question["label"]) {
      warnAndExit(`question missing label: ${key}`);
    }

    // check component
    if (!question["component"]) {
      warnAndExit(`question missing component: ${key}`);
    } else {
      switch (question["component"]) {
        case "Date":
          ["max_date", "min_date"].forEach((field) => {
            if (
              question[field] &&
              question[field] !== "today" &&
              !dateRegex.test(question[field])
            ) {
              warnAndExit(
                `${field} key should either be 'today' or in yyyy-mm-dd format`
              );
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
            warnAndExit(`question component requires options: ${key}`);
          }
          break;
        case "LikertScale":
          if (!question["statements"]) {
            warnAndExit(`question component requires statements: ${key}`);
          }
          break;
        case "SubForm":
          if (!question["questions"]) {
            warnAndExit(`question component requires questions: ${key}`);
          } else {
            validateQuestions(question["questions"]);
          }
          break;
        default:
          warnAndExit(
            `question has unknown component: ${key} - ${question["component"]} (must be one of TextArea, TextInput, Select, Radio, Checkbox, LikertScale, SubForm)`
          );
      }
    }
  });
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
    db.collection("forms").doc(id).set(form);
  });
