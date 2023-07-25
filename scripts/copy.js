const { ArgumentParser } = require("argparse");
const admin = require("firebase-admin");

const parser = new ArgumentParser({
  description: "PROVIDENT - copy data",
  add_help: true,
});

parser.add_argument("-e", "--emulator", {
  action: "store_true",
  help: "use emulator",
});

parser.add_argument("-c", "--collection", {
  required: true,
  help: "collection name",
});

parser.add_argument("-f", "--from", {
  required: true,
  help: "from document name",
});

parser.add_argument("-t", "--to", {
  required: true,
  help: "to document name",
});

const { emulator, collection, from, to } = parser.parse_args();

if (emulator) {
  console.log("using emulator");
  process.env.FIRESTORE_EMULATOR_HOST = "localhost:8088";
}
process.env.GOOGLE_APPLICATION_CREDENTIALS = "serviceAccount.json";

const app = admin.initializeApp();
const db = app.firestore();

const copyFrom = db.collection(collection).doc(from);
const copyTo = db.collection(collection).doc(to);

copyFrom.get().then((value) => {
  copyTo.set(value.data());
});
