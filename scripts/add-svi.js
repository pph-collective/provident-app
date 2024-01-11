const { ArgumentParser } = require("argparse");
const { parse } = require("csv-parse");
const fs = require("fs");
const admin = require("firebase-admin");
const aq = require("arquero");

const parser = new ArgumentParser({
  description: "PROVIDENT - add SVI data",
  add_help: true,
});

parser.add_argument("-e", "--emulator", {
  action: "store_true",
  help: "use emulator",
});
parser.add_argument("-p", "--period", {
  required: true,
  help: "which model period should this data be attached to (e.g. '2019-2')",
});
parser.add_argument("-c", "--cbgfile", {
  required: true,
  help: "path to cbg file",
});

parser.add_argument("-t", "--townfile", {
  required: true,
  help: "path to cbg file",
});

parser.add_argument("-r", "--rifile", {
  required: true,
  help: "path to ri file",
});

parser.add_argument("-s", "--seed", {
  action: "store_true",
  help: "Generate a json file with seed data instead of uploading to firebase",
});

const { emulator, period, cbgfile, townfile, rifile, seed } =
  parser.parse_args();

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
      JSON.stringify(records),
    );
    return;
  }
  const batchCommits = [];
  const batch = db.batch();
  const docRef = db.collection(collection).doc(period);
  batch.set(docRef, records);
  batchCommits.push(batch.commit());
  return Promise.all(batchCommits);
}

async function fromCsv(filename, callback) {
  const fileContents = fs.readFileSync(filename, "utf8");

  return new Promise((resolve, reject) => {
    parse(fileContents, { columns: true }, async (err, records) => {
      if (err) {
        reject(err);
      } else {
        try {
          resolve(await callback(records));
        } catch (e) {
          console.error(e);
          process.exit(1);
        }
      }
    });
  });
}

async function importCbg(filename) {
  return await fromCsv(filename, async (records) => {
    // Tells us whether the block group is in the intervention arm and which municipality it is in since the cbg does
    // not inherently tell us what town the block group was in
    const bgDataDoc = await db.collection("model_data").doc("bg_meta").get();
    const bgData = bgDataDoc.exists ? bgDataDoc.data().data : [];
    const blockGroups = bgData
      .filter((m) => (seed ? SEED_TOWNS.includes(m.municipality) : true))
      .map((m) => m.bg_id);

    return aq
      .from(records)
      .select(aq.not("")) // Removing empty columns
      .derive({
        bg_id: (d) => aq.op.substring(d.geoid, 5),
      })
      .objects()
      .filter((record) => blockGroups.includes(record.bg_id));
  });
}

async function importTowns(filename) {
  return await fromCsv(filename, async (records) => {
    return aq
      .from(records)
      .select(aq.not(""))
      .objects()
      .filter((m) => (seed ? SEED_TOWNS.includes(m.town) : true));
  });
}

async function main() {
  const cbg = await importCbg(cbgfile);
  const town = await importTowns(townfile);
  const ri = await fromCsv(rifile, (records) => records[0]);

  await writeToFirestore("svi_data", period, {
    cbg,
    town,
    ri,
  });
}

main().catch((e) => console.error(e));
