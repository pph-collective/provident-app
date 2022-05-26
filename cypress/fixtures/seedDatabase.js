const admin = require("firebase-admin");
const { seedDatabase } = require("./utils");
const FIREBASECONFIG = require("../../src/utils/firebaseConfig.json");

const firebaseJSON = require("../../firebase.json");
process.env.FIRESTORE_EMULATOR_HOST = `localhost:${firebaseJSON.emulators.firestore.port}`;
process.env.FIREBASE_AUTH_EMULATOR_HOST = `localhost:${firebaseJSON.emulators.auth.port}`;
admin.initializeApp(FIREBASECONFIG);

seedDatabase(admin).then((success) => {
  if (success) {
    console.log("SUCCESS db:seed -- Seeded Database");
  } else {
    console.log("SKIPPING db:seed -- admin is not on localhost");
  }
});
