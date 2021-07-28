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

export default {
  auth,
  db,
  async login(email, password) {
    try {
      const res = await auth.signInWithEmailAndPassword(email, password);
      await db.collection("activity_log").add({
        user: res.user.email,
        action: "login",
        datetime: Date.now(),
      });
      return res.user.toJSON();
    } catch (e) {
      console.log(e);
      throw e;
    }
  },
  async logout() {
    await auth.signOut();
  },
  async getUserRequest(email) {
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
  },
  async getOrgs() {
    const res = [];
    try {
      const docs = await db.collection("organizations").get();
      docs.forEach((doc) => res.push(doc.data()));
    } catch (err) {
      console.log(err);
    }
    return res;
  },
  async getForms() {
    const forms = [];
    try {
      const docs = await db.collection("forms").get();
      docs.forEach((doc) => {
        forms.push({ _id: doc.id, ...doc.data() });
      });
    } catch (err) {
      console.log(err);
    }

    return forms;
  },
  async getFormResponses(email, organization) {
    const formResponses = {};
    try {
      const userFormResponses = await db
        .collection("users")
        .doc(email)
        .collection("form_responses")
        .get();
      userFormResponses.forEach((doc) => {
        formResponses[doc.id] = { _id: doc.id, ...doc.data() };
      });

      const organizationFormResponses = await db
        .collection("organizations")
        .doc(organization)
        .collection("form_responses")
        .get();
      organizationFormResponses.forEach((doc) => {
        formResponses[doc.id] = { _id: doc.id, ...doc.data() };
      });

      return formResponses;
    } catch (err) {
      console.log(err);
    }

    return formResponses;
  },
  async updateUserFormResponse(email, form, response, status) {
    try {
      await db
        .collection("users")
        .doc(email)
        .collection("form_responses")
        .doc(form)
        .set({ status, response, last_updated: Date.now() });
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  },
  async updateOrganizationFormResponse(organization, form, response, status) {
    try {
      await db
        .collection("organizations")
        .doc(organization)
        .collection("form_responses")
        .doc(form)
        .set({ status, response, last_updated: Date.now() });
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  },
  async getModelDataPeriods() {
    const res = [];
    try {
      const docs = await db.collection("model_data").get();
      docs.forEach((doc) => res.push(doc.id));
    } catch (err) {
      console.log(err);
    }
    return res.sort().reverse();
  },
  async getModelData(period) {
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
  },
  async getModelPredictions(period) {
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
  },
};
