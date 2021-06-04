import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAyBC7oCAphc1j-h1SROiyH_mqONLFvHHQ",
  authDomain: "provident-ri.firebaseapp.com",
  projectId: "provident-ri",
  storageBucket: "provident-ri.appspot.com",
  messagingSenderId: "183954853797",
  appId: "1:183954853797:web:4a15d9c7d56c2ffc9c624c"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

let db = firebase.firestore();
let auth = firebase.auth();
if (location.hostname === "localhost") {
  db.settings({
    experimentalForceLongPolling: true,
    host: "localhost:8088",
    ssl: false
  });
  db.useEmulator("localhost", 8088);
  auth.useEmulator("http://localhost:9099");
}

export default {
  auth,
  db,
  firebaseConfig,
  async login(email, password) {
    const res = await auth.signInWithEmailAndPassword(email, password);
    await db.collection("activity_log").add({
      user: res.user.email,
      action: "login",
      datetime: Date.now()
    });
    return res.user;
  },
  async logout() {
    await auth.signOut();
  },
  async getUserRequest(email) {
    try {
      const doc = await db
        .collection("users")
        .doc(email)
        .get();
      if (doc.exists) {
        return doc.data();
      } else {
        return {};
      }
    } catch (err) {
      return {};
    }
  },
  async getForms() {
    const forms = [];
    try {
      const docs = await db.collection("forms").get();
      docs.forEach(doc => {
        forms.push({ _id: doc.id, ...doc.data() });
      });
    } catch (err) {
      console.log(err);
    }

    return forms;
  },
  async getUserForms(email) {
    const forms = {};
    try {
      const docs = await db
        .collection("users")
        .doc(email)
        .collection("form_responses")
        .get();
      docs.forEach(doc => {
        forms[doc.id] = { _id: doc.id, ...doc.data() };
      });
    } catch (err) {
      console.log(err);
    }

    return forms;
  },
  async updateUserForm(email, form, response, status) {
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
  }
};
