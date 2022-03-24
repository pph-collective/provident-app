const { ArgumentParser } = require("argparse");
const parse = require("csv-parse");
const fs = require("fs");
const admin = require("firebase-admin");

const parser = new ArgumentParser({
  description: "PROVIDENT - add zipcode csv",
  add_help: true,
});

parser.add_argument("-e", "--emulator", {
  action: "store_true",
  help: "check the firebase emulator for emails to send instead of the production database",
});
parser.add_argument("-s", "--seed", {
  action: "store_true",
  help: "Generate a json file with seed data instead of uploading to firebase",
});
parser.add_argument("-f", "--file", {
  required: true,
  help: "Path to data file",
});

const { emulator, seed, file } = parser.parse_args();

if (emulator) {
  console.log("using emulator");
  process.env.FIRESTORE_EMULATOR_HOST = "localhost:8088";
}
process.env.GOOGLE_APPLICATION_CREDENTIALS = "serviceAccount.json";

const app = admin.initializeApp();
const db = app.firestore();

function writeToFirestore(collection, doc, records) {
  if (seed) {
    fs.writeFileSync(`data/${collection}_${doc}.json`, JSON.stringify(records));
    return;
  }

  const batchCommits = [];
  const batch = db.batch();
  const docRef = db.collection(collection).doc(doc);
  batch.set(docRef, { data: records });
  batchCommits.push(batch.commit());
  return Promise.all(batchCommits);
}

async function importCsv() {
  const zipData = fs.readFileSync(file, "utf8");
  parse(zipData, { columns: true }, async (err, records) => {
    if (err) {
      console.log(err);
    } else {
      try {
        await writeToFirestore("map_data", "ri_zip_database", records);
      } catch (e) {
        console.error(e);
        process.exit(1);
      }
    }
  });
}

importCsv().catch((e) => console.error(e));
