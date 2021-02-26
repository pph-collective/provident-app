import firebase from "firebase/app";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCzDuAs69PfILvMnh47yK7Seb-wpBfM_7w",
  authDomain: "pro-found-vident-base.firebaseapp.com",
  projectId: "pro-found-vident-base",
  storageBucket: "pro-found-vident-base.appspot.com",
  messagingSenderId: "757633754348",
  appId: "1:757633754348:web:d3f39c13d5bca23e49b1c9"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// styling for scrollables
import "aos/dist/aos.css";

// Set up Vue
import { createApp } from "vue";
import App from "./App.vue";

import router from "./router";
require("@/assets/styles/main.scss");

createApp(App)
  .use(router)
  .mount("#app");
