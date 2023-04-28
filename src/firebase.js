import firebase from "firebase/compat/app";
import { getAnalytics } from "firebase/analytics";
import "firebase/compat/firestore";
import "firebase/compat/auth";

import * as aq from "arquero";
import { processEmailBody } from "./utils/emails";
import firebaseConfig from "./utils/firebaseConfig.json";

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

let db = firebase.firestore();
let auth = firebase.auth();
let emailSubjectPrefix = "";
if (location.hostname === "localhost") {
  db.settings({
    experimentalForceLongPolling: true,
    host: "localhost:8088",
    ssl: false,
  });
  db.useEmulator("localhost", 8088);
  auth.useEmulator("http://localhost:9099");
  emailSubjectPrefix = "TEST: ";
}

const logActivity = async (user, action, subAction = "") => {
  try {
    await db.collection("users").doc(user).collection("activity_log").add({
      user,
      action,
      subAction,
      datetime: Date.now(),
    });
  } catch (e) {
    console.warn("Activity logging failed: ", e);
  }
};

const login = async (email, password) => {
  try {
    const res = await auth.signInWithEmailAndPassword(email, password);
    return res.user.toJSON();
  } catch (e) {
    console.log(e);
    throw e;
  }
};

const logout = async () => await auth.signOut();

const getUserRequest = async (email) => {
  try {
    const doc = await db.collection("users").doc(email).get();
    if (doc.exists) {
      return doc.data();
    } else {
      return {};
    }
  } catch (err) {
    return {};
  }
};

const updateUser = async (user) => {
  await db.collection("users").doc(user.email).update(user);
};

const getCollection = async (collection) => {
  let res = [];
  try {
    const docs = await db.collection(collection).get();
    res = docs.docs.map((doc) => {
      return { _id: doc.id, ...doc.data() };
    });
  } catch (err) {
    console.log(err);
  }
  return res;
};

// common pattern for model related data which has an array of data under the data key
const getDataFromDoc = (res) => {
  if (res.exists) {
    return res.data().data;
  } else {
    return [];
  }
};

const getForms = async () => {
  const forms = {};

  for (const form of await getCollection("forms")) {
    forms[form._id] = form;
  }

  return forms;
};

const getFormResponses = async (email, organization) => {
  const formTypes = { users: email, organizations: organization };

  try {
    const formResponses = await Promise.all(
      Object.entries(formTypes).map(async ([collectionId, docId]) => {
        const response = await db
          .collection(collectionId)
          .doc(docId)
          .collection("form_responses")
          .get();
        return response.docs.map((doc) => ({ _id: doc.id, ...doc.data() }));
      })
    );

    return formResponses.reduce((acc, cur) => [...acc, ...cur], []);
  } catch (err) {
    console.log(err);
    return [];
  }
};

const addFormAssignment = async (formAssignmentData) => {
  const res = await db.collection("form_assignments").add(formAssignmentData);
  return res.id;
};

/**
 * @param {String} formType - "user" | "organization"
 * @param {Object[]} formResponses - list of form response objects
 * @param {Set<String>} assigned - set of emails or organization names
 * @returns {Promise<void>}
 */
const batchAddFormResponses = async (formType, formResponses, assigned) => {
  const writeBatch = db.batch();

  for (const formResponse of formResponses) {
    for (const assignee of assigned) {
      const updatedFormResponse = {
        ...formResponse,
        ...(formType === "organization" && { organization: assignee }),
        ...(formType === "user" && { user: assignee }),
      };

      const doc = db
        .collection(`${formType}s`)
        .doc(assignee)
        .collection("form_responses")
        .doc();
      writeBatch.set(doc, updatedFormResponse);
    }
  }

  await writeBatch.commit();
};

const updateFormResponse = async (formResponse, { email, organization }) => {
  const {
    _id,
    form: { type },
  } = formResponse;
  const typeMap = { user: email, organization };

  if (_id === undefined) {
    const res = await db
      .collection(`${type}s`)
      .doc(typeMap[type])
      .collection("form_responses")
      .add(formResponse);

    return res.id;
  } else {
    await db
      .collection(`${type}s`)
      .doc(typeMap[type])
      .collection("form_responses")
      .doc(_id)
      .set(formResponse);

    return _id;
  }
};

const getModelDataPeriods = async () => {
  const res = [];
  try {
    const doc = await db.collection("model_data").doc("periods").get();
    res.push(...getDataFromDoc(doc));
    res.sort().reverse();
  } catch (err) {
    console.log(err);
  }
  return res;
};

const getModelData = async (period) => {
  try {
    const modelMetaDoc = await db.collection("model_data").doc("bg_meta").get();
    const modelMeta = getDataFromDoc(modelMetaDoc);
    const modelDt = aq.from(modelMeta);

    const sviDataDoc = await db.collection("svi_data").doc(period).get();
    const { cbg, town, ri } = sviDataDoc.data();

    const landmarkDataDoc = await db
      .collection("landmark_data")
      .doc(period)
      .get();
    const landmarkData = getDataFromDoc(landmarkDataDoc);

    const tooltipDataDoc = await db
      .collection("tooltip_data")
      .doc(period)
      .get();
    const tooltipData = getDataFromDoc(tooltipDataDoc);

    return {
      cbg: modelDt
        .join(aq.from(cbg)) // joins on bg_id, geoid
        .filter((d) => d.municipality !== "")
        .objects()
        .map((row) => {
          // Filters the landmark data based on the block group and save it into the landmarks key for each block group
          row.landmarks = landmarkData.filter(
            (landmark) => landmark.bg_id === row.bg_id
          );
          row.tooltip = tooltipData.find(
            (tooltip) => tooltip.bg_id === row.bg_id
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
};

const getModelPredictions = async (period) => {
  try {
    const doc = await db.collection("model_predictions").doc(period).get();
    return getDataFromDoc(doc);
  } catch (err) {
    console.log(err);
    return [];
  }
};

const getZipcodes = async () => {
  try {
    const doc = await db.collection("map_data").doc("ri_zip_database").get();
    return getDataFromDoc(doc);
  } catch (err) {
    console.log(err);
    return [];
  }
};

const createEmail = async ({
  subject,
  to,
  body,
  sendDate = new Date().toISOString(),
}) => {
  try {
    const doc = {
      subject: emailSubjectPrefix + subject,
      to,
      body: processEmailBody(body),
      sendDate,
      sent: false,
    };
    await db.collection("emails").add(doc);
  } catch (err) {
    console.log(err);
  }
};

const addOrg = async (organization) => {
  const docId = organization.name;

  await db.collection("organizations").doc(docId).set(organization);

  return docId;
};

const getDataset = async (period, interventionArmUser) => {
  const data = await getModelData(period);
  if (interventionArmUser) {
    const predictions = await getModelPredictions(period);
    return {
      ...data,
      cbg: aq.from(data.cbg).join_left(aq.from(predictions), "bg_id").objects(),
    };
  } else {
    return data;
  }
};

export default {
  auth,
  db,
  addFormAssignment,
  addOrg,
  batchAddFormResponses,
  createEmail,
  getCollection,
  getFormResponses,
  getForms,
  getModelData,
  getDataset,
  getModelDataPeriods,
  getModelPredictions,
  getUserRequest,
  getZipcodes,
  logActivity,
  login,
  logout,
  updateFormResponse,
  updateUser,
};
