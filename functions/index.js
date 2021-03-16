const functions = require("firebase-functions");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
admin.initializeApp();

exports.addUser = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token.admin) {
    // Throwing an HttpsError so that the client gets the error details.
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated as an admin."
    );
  }

  try {
    // Grab the text parameter.
    const email = data.email;
    const displayName = data.name;

    const user = await admin.auth().createUser({ email, displayName });
    await admin.auth().setCustomUserClaims(user.uid, {
      organization: data.organization,
      admin: false
    });
    // Send back a message that we've successfully created the user
    return { uid: user.uid };
  } catch (err) {
    throw new functions.https.HttpsError("unknown", err.message, err);
  }
});
