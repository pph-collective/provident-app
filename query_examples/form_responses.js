// env GOOGLE_APPLICATION_CREDENTIALS must contain the path to your firebase credentials
// usage: `node form_responses.js`
// queries all of the form responses for all users and organizations and saves them to a file in downloads
// called `form_responses.json`. The document ID is added to the data's `id` key.
// adapted from https://firebase.google.com/docs/firestore/query-data/queries#collection-group-query

const admin = require("firebase-admin");
const fs = require("fs");
const os = require("os");

process.env.GOOGLE_APPLICATION_CREDENTIALS = "serviceAccount.json";

const app = admin.initializeApp();
const db = app.firestore();

const FILE_PATH = `${os.homedir()}/Downloads/form_responses.json`;

db.collectionGroup("form_responses")
  .get()
  .then((querySnapshot) => {
    const results = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });

    fs.writeFileSync(FILE_PATH, JSON.stringify(results, null, 2));
  });
