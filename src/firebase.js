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
if (location.hostname === "localhost") {
  db.settings({
    experimentalForceLongPolling: true,
    host: "localhost:8088",
    ssl: false,
  });
  db.useEmulator("localhost", 8088);
  auth.useEmulator("http://localhost:9099");
}

const logActivity = async (user, action) => {
  try {
    await db.collection("users").doc(user).collection("activity_log").add({
      user,
      action,
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

const getOrgs = async () => {
  const res = [];
  try {
    const docs = await db.collection("organizations").get();
    docs.forEach((doc) => res.push(doc.data()));
  } catch (err) {
    console.log(err);
  }
  return res;
};

const getForms = async () => {
  const forms = {};
  try {
    const docs = await db.collection("forms").get();
    docs.forEach((doc) => {
      forms[doc.id] = { _id: doc.id, ...doc.data() };
    });
  } catch (err) {
    console.log(err);
  }

  return forms;
};

const getFormAssignments = async () => {
  let formAssignments = [];
  try {
    const docs = await db.collection("form_assignments").get();

    formAssignments = docs.docs.map((doc) => {
      return { _id: doc.id, ...doc.data() };
    });

    return formAssignments;
  } catch (err) {
    console.log(err);
  }
};

const createFormAssignment = async (doc) => {
  try {
    await db.collection("form_assignments").add(doc);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

const getFormResponses = async (email, organization) => {
  let formResponses = [];
  try {
    const userFormResponses = await db
      .collection("users")
      .doc(email)
      .collection("form_responses")
      .get();

    const organizationFormResponses = await db
      .collection("organizations")
      .doc(organization)
      .collection("form_responses")
      .get();

    formResponses = [
      ...userFormResponses.docs,
      ...organizationFormResponses.docs,
    ];
    formResponses = formResponses.map((doc) => {
      return { _id: doc.id, ...doc.data() };
    });

    return formResponses;
  } catch (err) {
    console.log(err);
  }

  return formResponses;
};

const updateFormResponse = async (email, organization, formResponse) => {
  try {
    if (formResponse.type === "user") {
      await db
        .collection("users")
        .doc(email)
        .collection("form_responses")
        .doc(formResponse._id)
        .set(formResponse);
      return true;
    } else if (formResponse.type === "organization") {
      await db
        .collection("organizations")
        .doc(organization)
        .collection("form_responses")
        .doc(formResponse._id)
        .set(formResponse);
      return true;
    }
  } catch (e) {
    console.log(e);
    return false;
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

export default {
  auth,
  db,
  logActivity,
  login,
  logout,
  getUserRequest,
  getOrgs,
  getForms,
  getFormAssignments,
  createFormAssignment,
  getFormResponses,
  updateFormResponse,
  getModelDataPeriods,
  getModelData,
  getModelPredictions,
};
