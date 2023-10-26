const { ArgumentParser } = require("argparse");
const parse = require("csv-parse");
const fs = require("fs");
const admin = require("firebase-admin");
const aq = require("arquero");

const parser = new ArgumentParser({
  description: "PROVIDENT - add model predictions",
  add_help: true,
});

parser.add_argument("-e", "--emulator", {
  action: "store_true",
  help: "upload form to the emulator instead of production DB",
});
parser.add_argument("-s", "--seed", {
  action: "store_true",
  help: "if the form already exists, overwrite it",
});
parser.add_argument("-f", "--file", {
  required: true,
  help: "Path to data file",
});
parser.add_argument("-p", "--period", {
  required: true,
  help: "which model period should this data be attached to (e.g. '2019-2')",
});

const { emulator, seed, file, period } = parser.parse_args();

if (emulator) {
  console.log("using emulator");
  process.env.FIRESTORE_EMULATOR_HOST = "localhost:8088";
}
process.env.GOOGLE_APPLICATION_CREDENTIALS = "serviceAccount.json";

const app = admin.initializeApp();
const db = app.firestore();

const TOWN_BG_FILE = "src/assets/RI_CBG_Town.csv";
const INTERVENTION_TOWNS = [
  "West Warwick",
  "Warwick",
  "Warren",
  "Smithfield",
  "Providence",
  "North Kingstown",
  "Newport",
  "New Shoreham",
  "Narragansett",
  "Little Compton",
  "Johnston",
  "Jamestown",
  "East Greenwich",
  "Cumberland",
  "Cranston",
  "Coventry",
  "Charlestown",
  "Bristol",
  "Barrington",
];

const SEED_TOWNS = ["Little Compton", "Tiverton", "Portsmouth"];

aq.addFunction("isIntervention", (x) => INTERVENTION_TOWNS.includes(x));
aq.addFunction("isSeed", (x) => SEED_TOWNS.includes(x));

function writeToFirestore(collection, period, records) {
  if (seed) {
    fs.writeFileSync(
      `data/${collection}_${period}.json`,
      JSON.stringify(records),
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

// TODO: there are currently a couple block groups without a town name (review when 2020 census switchover happens)
async function importCsv(csvFileName) {
  const fileContents = fs.readFileSync(csvFileName, "utf8");
  parse(fileContents, { columns: true }, async (err, records) => {
    if (err) {
      console.log(err);
    } else {
      const lookupContents = fs.readFileSync(TOWN_BG_FILE, "utf8");
      parse(
        lookupContents,
        { columns: true },
        async (lookupErr, lookupRecords) => {
          if (lookupErr) {
            console.log(lookupErr);
          } else {
            try {
              let lookupDt = aq
                .from(lookupRecords)
                .derive({ municipality: (d) => aq.op.trim(d.NAME) })
                .derive({
                  intervention_arm: (d) => aq.op.isIntervention(d.municipality),
                  bg_id: (d) => aq.op.substring(d.GEOID, 5),
                })
                .filter((d) => d.intervention_arm);

              if (seed) {
                lookupDt = lookupDt.filter((d) => aq.op.isSeed(d.municipality));
              }

              lookupDt = lookupDt.select("GEOID", "bg_id");

              let dt = aq
                .from(records)
                .select("GEOID")
                .derive({ prediction: () => "1" })
                .join_right(lookupDt)
                .select("bg_id", "prediction")
                .impute({ prediction: () => "0" })
                .objects();

              console.log(`loading data for period ${period}`);
              // write predictions separately and only for intervention towns
              await writeToFirestore("model_predictions", period, dt);
            } catch (e) {
              console.error(e);
              process.exit(1);
            }
          }
        },
      );
    }
    console.log(`Wrote ${records.length} records`);
  });
}

importCsv(file).catch((e) => console.error(e));
