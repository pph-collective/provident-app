// env GOOGLE_APPLICATION_CREDENTIALS must contain the path to your firebase credentials
// usage: `node specific_form_responses.js`
// queries form responses for a specific user or organization and form type and saves them to a file in downloads
// called `form_response.json`. The document ID is added to the data's `id` key.
// adapted from https://firebase.google.com/docs/firestore/query-data/queries

const admin = require("firebase-admin");
const fs = require("fs");
const os = require("os");

process.env.GOOGLE_APPLICATION_CREDENTIALS = "serviceAccount.json";

const app = admin.initializeApp();
const db = app.firestore();

const FILE_PATH = `${os.homedir()}/Downloads/organization_form_responses.json`;
const FORM_TYPE = "organization"; // 'user' or 'organization'
const USER_OR_ORG = "PPH Collective"; // UPDATE THIS!
const FORM_ID = "neighborhood_rapid_assessment";

db.collection(FORM_TYPE)
  .doc(USER_OR_ORG)
  .collection("form_responses")
  .where("form_id", "==", FORM_ID)
  .get()
  .then((querySnapshot) => {
    const results = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });

    fs.writeFileSync(FILE_PATH, JSON.stringify(results, null, 2));
  });
