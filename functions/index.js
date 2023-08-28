const logger = require("firebase-functions/logger");
const functions = require("firebase-functions");
const firestore = require("@google-cloud/firestore");

const client = new firestore.v1.FirestoreAdminClient();
const bucket = "gs://provident-backups";

/**
 * Cloud function to automate backups to the Google Cloud
 * bucket every week.
 */
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
