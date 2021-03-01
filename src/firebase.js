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
  db.useEmulator("localhost", 8080);
  auth.useEmulator("http://localhost:9099");
}

export default {
  auth,
  db,
  async login(email, password) {
    return await auth.signInWithEmailAndPassword(email, password);
  },
  logout() {
    auth.signOut();
  }
};
