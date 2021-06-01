// env GOOGLE_APPLICATION_CREDENTIALS must contain the path to your firebase credentials
// usage: `node add-form.js my_id form.json`

const admin = require("firebase-admin");
const app = admin.initializeApp();
const db = app.firestore();
const fs = require("fs");

const id = process.argv[2];
const formPath = process.argv[3];

const rawdata = fs.readFileSync(formPath);
let form = JSON.parse(rawdata);

const dateRegex = new RegExp("^[0-9]{4}-[0-9]{2}-[0-9]{2}$");

const warnAndExit = warning => {
  console.warn(warning);
  process.exit(1);
};

const validateForm = form => {
  // check release date
  if (!form["release_date"] || !dateRegex.test(form["release_date"])) {
    warnAndExit("release_date key missing or not formatted as yyyy-mm-dd");
  }

  // check title
  if (!form["title"]) {
    warnAndExit("must provide title");
  }

  // check questions
  if (!form["questions"]) {
    warnAndExit("must provide questions");
  }

  Object.entries(form["questions"]).forEach(([key, question]) => {
    // check label
    if (!question["label"]) {
      warnAndExit(`question missing label: ${key}`);
    }

    // check component
    if (!question["component"]) {
      warnAndExit(`question missing component: ${key}`);
    } else {
      switch (question["component"]) {
        case "TextArea":
        case "TextInput":
          break;
        case "Select":
        case "Radio":
          if (!question["options"]) {
            warnAndExit(`question component requires options: ${key}`);
          }
          break;
        default:
          warnAndExit(
            `question has unknown component: ${key} - ${question["component"]} (must be one of TextArea, TextInput, Select, Radio)`
          );
      }
    }
  });
};

// check id isn't already in use
db.collection("forms")
  .doc(id)
  .get()
  .then(doc => {
    if (doc.exists) {
      warnAndExit("Form with this ID already exists - aborting");
    }

    // validate the form and upload
    validateForm(form);
    db.collection("forms")
      .doc(id)
      .set(form);
  });
