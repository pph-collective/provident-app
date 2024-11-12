import { initializeApp } from "firebase/app";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
} from "firebase/firestore";
import * as aq from "arquero";
import firebaseConfig from "./utils/firebaseConfig.json";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export async function getCollection(collectionPath) {
  let res = [];
  try {
    const docs = await getDocs(collection(db, collectionPath));
    res = docs.docs.map((doc) => {
      return { _id: doc.id, ...doc.data() };
    });
  } catch (err) {
    console.log(err);
  }
  return res;
}

// common pattern for model related data which has an array of data under the data key
function getDataFromDoc(res) {
  if (res.exists) {
    return res.data().data;
  } else {
    return [];
  }
}

export async function getModelDataPeriods() {
  const res = [];
  try {
    const document = await getDoc(doc(db, "model_data", "periods"));
    res.push(...getDataFromDoc(document));
    res.sort().reverse();
  } catch (err) {
    console.log(err);
  }
  return res;
}

export async function getModelData(period) {
  try {
    const modelMetaDoc = await getDoc(doc(db, "model_data", "bg_meta"));
    const modelMeta = getDataFromDoc(modelMetaDoc);
    const modelDt = aq.from(modelMeta);

    const sviDataDoc = await getDoc(doc(db, "svi_data", period));
    const { cbg, town, ri } = sviDataDoc.data();

    const landmarkDataDoc = await getDoc(doc(db, "landmark_data", period));
    const landmarkData = getDataFromDoc(landmarkDataDoc);

    const tooltipDataDoc = await getDoc(doc(db, "tooltip_data", period));
    const tooltipData = getDataFromDoc(tooltipDataDoc);

    return {
      cbg: modelDt
        .join(aq.from(cbg)) // joins on bg_id, geoid
        .filter((d) => d.municipality !== "")
        .objects()
        .map((row) => {
          // Filters the landmark data based on the block group and save it into the landmarks key for each block group
          row.landmarks = landmarkData.filter(
            (landmark) => landmark.bg_id === row.bg_id,
          );
          row.tooltip = tooltipData.find(
            (tooltip) => tooltip.bg_id === row.bg_id,
          );
          return row;
        }),
      town,
      ri,
    };
  } catch (err) {
    console.log(err);
    return {
      cbg: [],
      town: [],
      ri: [],
    };
  }
}

export async function getModelPredictions(period) {
  try {
    const document = await getDoc(doc(db, "model_predictions", period));
    return getDataFromDoc(document);
  } catch (err) {
    console.log(err);
    return [];
  }
}

export async function getZipcodes() {
  try {
    const document = await getDoc(doc(db, "map_data", "ri_zip_database"));
    return getDataFromDoc(document);
  } catch (err) {
    console.log(err);
    return [];
  }
}

export async function getDataset(period) {
  const data = await getModelData(period);
  const predictions = await getModelPredictions(period);
  return {
    ...data,
    cbg: aq.from(data.cbg).join_left(aq.from(predictions), "bg_id").objects(),
  };
}
