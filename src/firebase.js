import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAyBC7oCAphc1j-h1SROiyH_mqONLFvHHQ",
  authDomain: "provident-ri.firebaseapp.com",
  projectId: "provident-ri",
  storageBucket: "provident-ri.appspot.com",
  messagingSenderId: "183954853797",
  appId: "1:183954853797:web:4a15d9c7d56c2ffc9c624c",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

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
 * @param {String} form_type - "user" | "organization"
 * @param {Object[]} formResponses - list of form response objects
 * @param {Set<String>} assigned - set of emails or organization names
 * @returns {Promise<void>}
 */
const batchAddFormResponses = async (form_type, formResponses, assigned) => {
  const writeBatch = db.batch();

  for (const formResponse of formResponses) {
    for (const assignee of assigned) {
      const doc = db
        .collection(`${form_type}s`)
        .doc(assignee)
        .collection("form_responses")
        .doc();
      writeBatch.set(doc, formResponse);
    }
  }

  await writeBatch.commit();
};

const updateFormResponse = async (formResponse, { email, organization }) => {
  const { _id, form } = formResponse;
  const { type } = form;
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
    const docs = await db.collection("model_data").get();
    docs.forEach((doc) => res.push(doc.id));
  } catch (err) {
    console.log(err);
  }
  return res.sort().reverse();
};

const getModelData = async (period) => {
  try {
    const doc = await db.collection("model_data").doc(period).get();
    if (doc.exists) {
      return doc.data().data;
    } else {
      return [];
    }
  } catch (err) {
    console.log(err);
    return [];
  }
};

const getModelPredictions = async (period) => {
  try {
    const doc = await db.collection("model_predictions").doc(period).get();
    if (doc.exists) {
      return doc.data().data;
    } else {
      return [];
    }
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
      body,
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
  getModelDataPeriods,
  getModelPredictions,
  getUserRequest,
  logActivity,
  login,
  logout,
  updateFormResponse,
  updateUser,
};
