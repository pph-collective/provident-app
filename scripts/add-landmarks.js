const { ArgumentParser } = require("argparse");
const parse = require("csv-parse");
const fs = require("fs");
const admin = require("firebase-admin");
const aq = require("arquero");

const parser = new ArgumentParser({
  description: "PROVIDENT - add model data",
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
parser.add_argument("-p", "--period", {
  required: true,
  help: "Name of model time period",
});

const { emulator, seed, file, period } = parser.parse_args();

if (emulator) {
  console.log("using emulator");
  process.env.FIRESTORE_EMULATOR_HOST = "localhost:8088";
}
process.env.GOOGLE_APPLICATION_CREDENTIALS = "serviceAccount.json";

const app = admin.initializeApp();
const db = app.firestore();

const SEED_TOWNS = ["Little Compton", "Tiverton", "Portsmouth"];

aq.addFunction("isSeed", (x) => SEED_TOWNS.includes(x));

function writeToFirestore(collection, doc, records) {
  if (seed) {
    fs.writeFileSync(`data/${collection}_${doc}.json`, JSON.stringify(records));
    return;
  }

  const batchCommits = [];
  let batch = db.batch();
  var docRef = db.collection(collection).doc(doc);
  batch.set(docRef, { data: records });
  batchCommits.push(batch.commit());
  return Promise.all(batchCommits);
}

// TODO: there are currently a couple block groups without a town name (review when 2020 census switchover happens)
async function importCsv() {
  const landmarkData = fs.readFileSync(file, "utf8");
  parse(landmarkData, { columns: true }, async (err, records) => {
    if (err) {
      console.log(err);
    } else {
      try {
        let dt = aq.from(records).derive({
          bg_id: (d) => aq.op.substring(d.poi_cbg, 5),
        });

        if (seed) {
          dt = dt.filter((d) => aq.op.isSeed(d.city));
        }

        dt = dt.select(
          "bg_id",
          "location_name",
          "top_category",
          "latitude",
          "longitude",
          "street_address",
          "city",
          "postal_code",
          "total_visitors",
          "rank"
        );

        writeToFirestore("landmark_data", period, dt.objects());
      } catch (e) {
        console.error(e);
        process.exit(1);
      }
    }
  });
}

importCsv().catch((e) => console.error(e));
