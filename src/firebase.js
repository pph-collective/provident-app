import { initializeApp } from "firebase/app";
import {
  connectAuthEmulator,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  addDoc,
  collection,
  connectFirestoreEmulator,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import * as aq from "arquero";
import { processEmailBody } from "./utils/emails";
import firebaseConfig from "./utils/firebaseConfig.json";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
let emailSubjectPrefix = "";
if (location.hostname === "localhost") {
  db._setSettings({
    experimentalForceLongPolling: true,
    host: "localhost:8088",
    ssl: false,
  });
  connectFirestoreEmulator(db, "127.0.0.1", 8088);
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
  emailSubjectPrefix = "TEST: ";
}

export async function logActivity(user, action, subAction = "") {
  try {
    await addDoc(collection(db, `users/${user}/activity_log`), {
      user,
      action,
      subAction,
      datetime: Date.now(),
    });
  } catch (e) {
    console.warn("Activity logging failed: ", e);
  }
}

export async function login(email, password) {
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    return res.user.toJSON();
  } catch (e) {
    console.log(e);
    let message = e.message;
    if (e.message === "Firebase: Error (auth/wrong-password).") {
      message = "The password is invalid or the user does not have a password";
    }
    throw {
      ...e,
      message,
    };
  }
}

export async function logout() {
  await signOut(auth);
}

export async function getUserRequest(email) {
  try {
    const document = await getDoc(doc(db, "users", email));
    if (document.exists()) {
      return document.data();
    } else {
      return {};
    }
  } catch (err) {
    return {};
  }
}

export async function updateUser(user) {
  await updateDoc(doc(db, "users", user.email), user);
}

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

export async function getForms() {
  const forms = {};

  for (const form of await getCollection("forms")) {
    forms[form._id] = form;
  }

  return forms;
}

export async function getFormResponses(email, organization) {
  const formTypes = { users: email, organizations: organization };

  try {
    const formResponses = await Promise.all(
      Object.entries(formTypes).map(async ([collectionId, docId]) => {
        const response = await getDocs(
          collection(db, collectionId, docId, "form_responses"),
        );
        return response.docs.map((doc) => ({ _id: doc.id, ...doc.data() }));
      }),
    );

    return formResponses.reduce((acc, cur) => [...acc, ...cur], []);
  } catch (err) {
    console.log(err);
    return [];
  }
}

export async function addFormAssignment(formAssignmentData) {
  const res = await addDoc(
    collection(db, "form_assignments"),
    formAssignmentData,
  );
  return res.id;
}

/**
 * @param {String} formType - "user" | "organization"
 * @param {Object[]} formResponses - list of form response objects
 * @param {Set<String>} assigned - set of emails or organization names
 * @returns {Promise<void>}
 */
export async function batchAddFormResponses(formType, formResponses, assigned) {
  const batch = writeBatch(db);

  for (const formResponse of formResponses) {
    for (const assignee of assigned) {
      const updatedFormResponse = {
        ...formResponse,
        ...(formType === "organization" && { organization: assignee }),
        ...(formType === "user" && { user: assignee }),
      };

      const document = doc(
        collection(db, `${formType}s`, assignee, "form_responses"),
      );
      batch.set(document, updatedFormResponse);
    }
  }

  await batch.commit();
}

export async function updateFormResponse(
  formResponse,
  { email, organization },
) {
  const {
    _id,
    form: { type },
  } = formResponse;
  const typeMap = { user: email, organization };

  if (_id === undefined) {
    const res = await addDoc(
      collection(db, `${type}s`, typeMap[type], "form_responses"),
      formResponse,
    );

    return res.id;
  } else {
    await setDoc(
      doc(db, `${type}s`, typeMap[type], "form_responses", _id),
      formResponse,
    );

    return _id;
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

export async function createEmail({
  subject,
  to,
  body,
  sendDate = new Date().toISOString(),
}) {
  try {
    const document = {
      subject: emailSubjectPrefix + subject,
      to,
      body: processEmailBody(body),
      sendDate,
      sent: false,
    };
    await addDoc(collection(db, "emails"), document);
  } catch (err) {
    console.log(err);
  }
}

export async function addOrg(organization) {
  const docId = organization.name;

  await setDoc(doc(db, "organizations", docId), organization);

  return docId;
}

export async function getDataset(period, interventionArmUser) {
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
}
