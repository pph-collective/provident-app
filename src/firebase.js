import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/functions";

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
let fn = firebase.functions();
if (location.hostname === "localhost") {
  db.useEmulator("localhost", 8088);
  auth.useEmulator("http://localhost:9099");
  fn.useEmulator("localhost", 9090);
} else {
  fn = fn.region("us-central1");
}

export default {
  auth,
  db,
  fn,
  async login(email, password) {
    const res = await auth.signInWithEmailAndPassword(email, password);
    db.collection("activity_log").add({
      user: res.user.uid,
      action: "login",
      datetime: Date.now()
    });
    return res.user;
  },
  async logout() {
    await auth.signOut();
  }
};
