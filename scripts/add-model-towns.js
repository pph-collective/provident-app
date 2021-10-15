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

const { emulator, seed } = parser.parse_args();

if (emulator) {
  console.log("using emulator");
  process.env.FIRESTORE_EMULATOR_HOST = "localhost:8088";
}
process.env.GOOGLE_APPLICATION_CREDENTIALS = "serviceAccount.json";

const app = admin.initializeApp();
const db = app.firestore();

const TOWN_BG_FILE = "src/assets/RI_CBG_Town.csv";
const INTERVENTION_TOWNS = [
  "Barrington",
  "Charlestown",
  "Coventry",
  "Cumberland",
  "East Providence",
  "Glocester",
  "Little Compton",
  "Middletown",
  "Narragansett",
  "New Shoreham",
  "Newport",
  "North Kingstown",
  "North Providence",
  "North Smithfield",
  "Portsmouth",
  "Scituate",
  "Smithfield",
  "Warren",
  "West Warwick",
  "Westerly",
];

const SEED_TOWNS = ["Little Compton", "Tiverton", "Portsmouth"];

aq.addFunction("isIntervention", (x) => INTERVENTION_TOWNS.includes(x));
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
  const bgData = fs.readFileSync(TOWN_BG_FILE, "utf8");
  parse(bgData, { columns: true }, async (err, records) => {
    if (err) {
      console.log(err);
    } else {
      try {
        let dt = aq
          .from(records)
          .derive({ municipality: (d) => aq.op.trim(d.NAME) })
          .derive({
            intervention_arm: (d) => aq.op.isIntervention(d.municipality),
            bg_id: (d) => aq.op.substring(d.GEOID, 5),
          })
          .select("GEOID", "bg_id", "municipality", "intervention_arm")
          .rename({ GEOID: "geoid" });

        if (seed) {
          dt = dt.filter((d) => aq.op.isSeed(d.municipality));
        }

        writeToFirestore("model_data", "bg_meta", dt.objects());
        writeToFirestore("model_data", "periods", ["2018-2", "2019-1"]);
      } catch (e) {
        console.error(e);
        process.exit(1);
      }
    }
  });
}

importCsv().catch((e) => console.error(e));
