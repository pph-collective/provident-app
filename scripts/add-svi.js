const { ArgumentParser } = require("argparse");
const parse = require("csv-parse");
const fs = require("fs");
const admin = require("firebase-admin");
const aq = require("arquero");

const parser = new ArgumentParser({
  description: "PROVIDENT - add SVI data",
  add_help: true,
});

parser.add_argument("-e", "--emulator", {
  action: "store_true",
  help: "check the firebase emulator for emails to send instead of the production database",
});
parser.add_argument("-p", "--period", {
  required: true,
  help: "which model period should this data be attached to (e.g. '2019-2')",
});
parser.add_argument("-f", "--file", {
  required: true,
  help: "file to read the data from",
});
parser.add_argument("-s", "--seed", {
  action: "store_true",
  help: "Generate a json file with seed data instead of uploading to firebase",
});

const { emulator, period, file, seed } = parser.parse_args();

if (emulator) {
  // assumes --emulator is the arg
  console.log("using emulator");
  process.env.FIRESTORE_EMULATOR_HOST = "localhost:8088";
}

process.env.GOOGLE_APPLICATION_CREDENTIALS = "serviceAccount.json";

const SEED_TOWNS = ["Little Compton", "Tiverton", "Portsmouth"];

const app = admin.initializeApp();
const db = app.firestore();

function writeToFirestore(collection, period, records) {
  if (seed) {
    fs.writeFileSync(
      `data/${collection}_${period}.json`,
      JSON.stringify(records)
    );
    return;
  }
  const batchCommits = [];
  let batch = db.batch();
  var docRef = db.collection(collection).doc(period);
  batch.set(docRef, { data: records });
  batchCommits.push(batch.commit());
  return Promise.all(batchCommits);
}

async function importCsv(csvFileName) {
  const fileContents = fs.readFileSync(csvFileName, "utf8");
  parse(fileContents, { columns: true }, async (err, records) => {
    if (err) {
      console.log(err);
    } else {
      try {
        const bgDataDoc = await db
          .collection("model_data")
          .doc("bg_meta")
          .get();
        const bgData = bgDataDoc.exists ? bgDataDoc.data().data : [];
        const blockGroups = bgData
          .filter((m) => (seed ? SEED_TOWNS.includes(m.municipality) : true))
          .map((m) => m.bg_id);

        const dt = aq
          .from(records)
          .select(aq.not(""))
          .derive({
            bg_id: (d) => aq.op.substring(d.geoid, 5),
          })
          .objects()
          .filter((record) => blockGroups.includes(record.bg_id));

        await writeToFirestore("svi_data", period, dt);

        console.log(`Wrote ${dt.length} records`);
      } catch (e) {
        console.error(e);
        process.exit(1);
      }
    }
  });
}

importCsv(file).catch((e) => console.error(e));
