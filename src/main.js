// styling for scrollables
import "aos/dist/aos.css";

// Set up Vue
import { createApp } from "vue";
import App from "./App.vue";

import store from "./store";
import router from "./router";
import fb from "@/firebase";

// general styling
require("@/assets/styles/main.scss");

// listen for changes to user
fb.auth.onAuthStateChanged(async user => {
  store.dispatch("fetchUser", user);
  if (user) {
    let token = await user.getIdTokenResult();
    if (token.claims && token.claims.admin) {
      store.dispatch("fetchAdmin", true);
    } else {
      store.dispatch("fetchAdmin", false);
    }
  } else {
    store.dispatch("fetchAdmin", false);
  }
});

createApp(App)
  .use(router)
  .use(store)
  .mount("#app");
