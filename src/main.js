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
  if (user) {
    const { status, organization } = await fb.getUserRequest(user.email);
    if (status === "approved") {
      store.dispatch("fetchUser", { ...user, status, organization });
      let token = await user.getIdTokenResult();
      if (token.claims && token.claims.admin) {
        store.dispatch("fetchAdmin", true);
      } else {
        store.dispatch("fetchAdmin", false);
      }
      return;
    }
  }

  // fallthrough
  store.dispatch("fetchUser", null);
  store.dispatch("fetchAdmin", false);
});

createApp(App)
  .use(router)
  .use(store)
  .mount("#app");
