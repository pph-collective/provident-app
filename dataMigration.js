// Open
const fs = require("fs");
const admin = require("firebase-tools");
const rawdata = fs.readFileSync("./data/form_responses.json");
const formResponses = JSON.parse(rawdata);

const FILE_PATH = "./data/ellen.json";

process.env.GOOGLE_APPLICATION_CREDENTIALS = "serviceAccount.json";

const app = admin.initializeApp();
const db = app.firestore();

const batch = admin.firestore().batch();

const result = [];

formResponses.forEach((formResponse) => {
  const { previous_id, users_edited, user_submitted, organization, id } =
    formResponse;

  if (previous_id !== undefined) {
    const previousFormResponse = formResponses.find(
      (f) => f.id === previous_id
    );
    const mergeUsers = (users_edited ?? [])
      .concat(previousFormResponse.users_edited ?? [])
      .concat([user_submitted])
      .filter((u) => u !== undefined);

    formResponse.users_edited = [...new Set(mergeUsers)];

    // path
    const docPath = `organizations/${organization}/form_responses/${id}`;
    console.log(docPath);

    result.push(formResponse);
  }

  // Update firebase
  // Find the path here
});

// add expire_dates to all of the old form responses

// Associate followup forms with a user, grab from the previous form

// add form id to the followup forms
// -- could match on form title instead of form id which i think is great

// Save back to firebase
