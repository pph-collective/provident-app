/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const logger = require("firebase-functions/logger");
const functions = require("firebase-functions");
const firestore = require("@google-cloud/firestore");

const client = new firestore.v1.FirestoreAdminClient();
const bucket = "gs://BUCKET_NAME";

exports.scheduledFirestoreExport = functions.pubsub
  .schedule("0 23 * * SUN") // Every Sunday at 11 PM GMT.
  .onRun(async () => {
    logger.info("Starting Backup Function");

    const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
    const databaseName = client.databasePath(projectId, "(default)");

    try {
      const responses = await client.exportDocuments({
        name: databaseName,
        outputUriPrefix: bucket,
        collectionIds: [],
      });
      const response = responses[0];
      logger.info(`Operation Name: ${response["name"]}`);
    } catch (ex) {
      logger.error(ex);
      throw new Error("Export operation failed");
    }

    logger.info("Ending Backup Function");
  });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
