// env GOOGLE_APPLICATION_CREDENTIALS must contain the path to your firebase credentials
// usage: `node add-admin.js admin@email.com`
// the admin must already be a user

const admin = require("firebase-admin");
const app = admin.initializeApp();

const email = process.argv[2];
process.env.GOOGLE_APPLICATION_CREDENTIALS = "serviceAccount.json";

app
  .auth()
  .getUserByEmail(email)
  .then((user) => {
    app
      .auth()
      .setCustomUserClaims(user.uid, { admin: true })
      .then(() => process.exit());
  });
