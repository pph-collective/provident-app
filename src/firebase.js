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

const updateUser = async (user) => {
  db.collection("users").doc(user.email).update(user);
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
  try {
    const docs = await db.collection("forms").get();
    for (const doc of docs.docs) {
      forms[doc.id] = { _id: doc.id, ...doc.data() };
    }
  } catch (err) {
    console.log(err);
  }

  return forms;
};

const getForm = async (formId) => {
  try {
    const doc = await db.collection("forms").doc(formId).get();
    return { _id: doc.id, ...doc.data() };
  } catch (err) {
    console.log(err);
    return {};
  }
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

/**
 * Returns a set of organization names filtered by the target
 *
 * @param {Object} target
 * @param {Object[]} organizations - array of all of the organizations
 * @returns {Set<String>}
 */
const getAssignedOrgs = (target, organizations) => {
  const assignedGroups = [...target.groups];

  const allOrgs = organizations.map((org) => org.name);
  const interventionOrgs = organizations
    .filter((org) => org.intervention_arm)
    .map((org) => org.name);
  const controlOrgs = organizations
    .filter((org) => !org.intervention_arm)
    .map((org) => org.name);

  return new Set([
    ...target.organizations,
    ...(assignedGroups.includes("all") ? allOrgs : []),
    ...(assignedGroups.includes("intervention") ? interventionOrgs : []),
    ...(assignedGroups.includes("control") ? controlOrgs : []),
  ]);
};

/**
 * Returns a set of user emails filtered by the target
 *
 * @param {Object} target
 * @param {Object[]} organizations - array of all the organizations
 * @param {Object[]} users - array of all the users
 * @returns {Set<String>}
 */
const getAssignedUsers = (target, organizations, users) => {
  const assignedOrgs = getAssignedOrgs(target, organizations);
  return new Set([
    ...target.users,
    ...users
      .filter((u) => assignedOrgs.has(u.organization))
      .map((u) => u.email),
  ]);
};

const getBlankFormResponse = (formAssignment) => {
  return {
    form_id: formAssignment.form_id,
    type: formAssignment.form_type,
    form_assignment_id: formAssignment._id,
    release_date: formAssignment.release_date,
    expire_date: formAssignment.expire_date,
    response: {},
    status: "Not Started",
    last_updated: Date.now(),
  };
};

const createFormResponses = async (blankFormResponse, assigned) => {
  let formResponseIds = [];

  try {
    if (blankFormResponse.type === "organization") {
      for (const org of assigned) {
        formResponseIds.push(
          await updateFormResponse(blankFormResponse, { organization: org })
        );
      }
    } else if (blankFormResponse.type === "user") {
      for (const email of assigned) {
        formResponseIds.push(
          await updateFormResponse(blankFormResponse, { email })
        );
      }
    }
  } catch (err) {
    console.log(err);
  }

  return formResponseIds;
};

const updateFormResponse = async (formResponse, options) => {
  const { type, _id } = formResponse;
  const { email, organization } = options;
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

export default {
  auth,
  db,
  logActivity,
  login,
  logout,
  getCollection,
  getUserRequest,
  updateUser,
  getForm,
  getForms,
  getFormResponses,
  getBlankFormResponse,
  getAssignedOrgs,
  getAssignedUsers,
  createFormResponses,
  updateFormResponse,
  getModelDataPeriods,
  getModelData,
  getModelPredictions,
};
