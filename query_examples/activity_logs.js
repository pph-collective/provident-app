// env GOOGLE_APPLICATION_CREDENTIALS must contain the path to your firebase credentials
// usage: `node activity_logs.js`
// queries all of the activity logs for all users and saves them to a file in downloads
// called `activity_logs.json`. The document ID is added to the data's `id` key.
// adapted from https://firebase.google.com/docs/firestore/query-data/queries#collection-group-query

const admin = require("firebase-admin");
const fs = require("fs");

process.env.GOOGLE_APPLICATION_CREDENTIALS = "serviceAccount.json";

const app = admin.initializeApp();
const db = app.firestore();

const FILE_PATH = "~/downloads/activity_logs.json";

db.collectionGroup("activity_log")
  .get()
  .then((querySnapshot) => {
    const results = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });

    fs.writeFileSync(FILE_PATH, JSON.stringify(results, null, 2));
  });
