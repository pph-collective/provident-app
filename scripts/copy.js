const admin = require("firebase-admin");

const emulator = false;

if (emulator) {
  console.log("using emulator");
  process.env.FIRESTORE_EMULATOR_HOST = "localhost:8088";
}
process.env.GOOGLE_APPLICATION_CREDENTIALS = "serviceAccount.json";

const app = admin.initializeApp();
const db = app.firestore();

const copyFrom = db.collection("svi_data").doc("2022-1");
const copyTo = db.collection("svi_data").doc("2022-2");

copyFrom.get().then((value) => {
  copyTo.set(value.data());
});
