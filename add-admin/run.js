// env GOOGLE_APPLICATION_CREDENTIALS must contain the path to your firebase credentials
// usage: `node run.js admin@email.com`
// the admin must already be a user

var admin = require("firebase-admin");
var app = admin.initializeApp();

var email = process.argv[2];

app
  .auth()
  .getUserByEmail(email)
  .then(user => {
    app.auth().setCustomUserClaims(user.uid, { admin: true });
    process.exit();
  });
