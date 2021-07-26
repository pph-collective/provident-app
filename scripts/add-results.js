const parse = require("csv-parse");
const fs = require("fs");
const admin = require("firebase-admin");
const aq = require("arquero");

const file = process.argv[2];
if (process.argv.length > 3) {
  // assumes --emulator is the 4th arg
  console.log("using emulator");
  process.env.FIRESTORE_EMULATOR_HOST = "localhost:8088";
}
process.env.GOOGLE_APPLICATION_CREDENTIALS = "serviceAccount.json";

const app = admin.initializeApp();
const db = app.firestore();

const TOWN_BG_FILE = "src/assets/RI_CBG_Town.csv";
const PREDICTION_COLUMNS = ["flag_1", "flag_2"];
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

aq.addFunction("isIntervention", (x) => INTERVENTION_TOWNS.includes(x));

function writeToFirestore(collection, period, records) {
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
                })
                .select(
                  "GEOID",
                  "NAMELSAD",
                  "municipality",
                  "intervention_arm"
                );
              let dt = aq
                .from(records)
                .select(aq.not(""))
                .derive({
                  id: (d) => `${d.year}-${d.period}`,
                  bg_id: (d) => aq.op.substring(d.geoid, 5),
                })
                .join(lookupDt, ["geoid", "GEOID"]);
              let periods = dt.select("id").dedupe();
              for (const periodRow of periods) {
                let period = periodRow.id;
                console.log(`loading data for period ${period}`);
                let periodRows = dt.filter(`d.id === '${period}'`);
                // remove predictions
                let modelData = periodRows
                  .select(aq.not(...PREDICTION_COLUMNS))
                  .objects();
                await writeToFirestore("model_data", period, modelData);
                // write predictions separately and only for intervention towns
                let modelPredictions = periodRows
                  .filter((d) => d.intervention_arm)
                  .select("bg_id", ...PREDICTION_COLUMNS)
                  .objects();
                await writeToFirestore(
                  "model_predictions",
                  period,
                  modelPredictions
                );
              }
            } catch (e) {
              console.error(e);
              process.exit(1);
            }
          }
        }
      );
    }
    console.log(`Wrote ${records.length} records`);
  });
}

importCsv(file).catch((e) => console.error(e));
