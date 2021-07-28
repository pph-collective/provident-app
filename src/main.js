// Set up Vue
import { createApp } from "vue";
import App from "./App.vue";

import store from "./store";
import router from "./router";
import fb from "@/firebase";

// general styling
require("@/assets/styles/main.scss");

// form components - needed globally
import FormTextInput from "@/components/form/TextInput";
import FormTextArea from "@/components/form/TextArea";
import FormSelect from "@/components/form/Select";
import FormRadio from "@/components/form/Radio";
import FormLikertScale from "@/components/form/LikertScale";
import FormCheckbox from "@/components/form/Checkbox";

// listen for changes to user
fb.auth.onAuthStateChanged(async (user) => {
  if (user) {
    const { status, organization, role } = await fb.getUserRequest(user.email);
    if (status === "approved") {
      store.dispatch("fetchUser", {
        ...user.toJSON(),
        status,
        organization,
        role,
      });
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
  .component("FormTextInput", FormTextInput)
  .component("FormTextArea", FormTextArea)
  .component("FormSelect", FormSelect)
  .component("FormRadio", FormRadio)
  .component("FormLikertScale", FormLikertScale)
  .component("FormCheckbox", FormCheckbox)
  .mount("#app");
