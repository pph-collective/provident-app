const admin = require("firebase-admin");
const { seedDatabase } = require("./utils");
const FIREBASECONFIG = require("../../src/utils/firebaseConfig.json");

process.env.FIRESTORE_EMULATOR_HOST = "localhost:8088";
admin.initializeApp(FIREBASECONFIG);

seedDatabase(admin).then((success) => {
  if (success) {
    console.log("SUCCESS db:seed -- Seeded Database");
  } else {
    console.log("SKIPPING db:seed -- admin is not on localhost");
  }
});
