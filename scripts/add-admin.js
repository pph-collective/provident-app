// env GOOGLE_APPLICATION_CREDENTIALS must contain the path to your firebase credentials
// usage: `node add-admin.js admin@email.com`
// the admin must already be a user
const { ArgumentParser } = require("argparse");
const admin = require("firebase-admin");

const parser = new ArgumentParser({
  description: "PROVIDENT - add admin user",
  add_help: true,
});

parser.add_argument("-e", "--email", {
  required: true,
  help: "email of the user",
});

const { email } = parser.parse_args();

process.env.GOOGLE_APPLICATION_CREDENTIALS = "serviceAccount.json";

const app = admin.initializeApp();

app
  .auth()
  .getUserByEmail(email)
  .then((user) => {
    app
      .auth()
      .setCustomUserClaims(user.uid, { admin: true })
      .then(() => process.exit());
  });
