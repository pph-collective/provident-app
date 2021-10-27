// Set up Vue
import { createApp } from "vue";
import App from "./App.vue";

import store from "./store";
import router from "./router";
import fb from "@/firebase";

// general styling
require("@/assets/styles/main.scss");

// form components - needed globally
import FormCheckbox from "@/components/form/Checkbox";
import FormDate from "@/components/form/Date";
import FormLikertScale from "@/components/form/LikertScale";
import FormRadio from "@/components/form/Radio";
import FormSelect from "@/components/form/Select";
import FormTextArea from "@/components/form/TextArea";
import FormTextInput from "@/components/form/TextInput";
import FormSubForm from "@/components/form/SubForm";

// listen for changes to user
fb.auth.onAuthStateChanged(async (user) => {
  await store.dispatch("fetchOrgs");

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
      store.dispatch("fetchAdmin", token.claims && token.claims.admin);
      // purposefully not waiting for logging to complete
      fb.logActivity(user.email, "login");
      store.dispatch("setLoaded");
      return;
    }
  }

  // fallthrough
  store.dispatch("fetchUser", null);
  store.dispatch("fetchAdmin", false);
  store.dispatch("setLoaded");
});

createApp(App)
  .use(router)
  .use(store)
  .component("FormCheckbox", FormCheckbox)
  .component("FormDate", FormDate)
  .component("FormLikertScale", FormLikertScale)
  .component("FormRadio", FormRadio)
  .component("FormSelect", FormSelect)
  .component("FormSubForm", FormSubForm)
  .component("FormTextArea", FormTextArea)
  .component("FormTextInput", FormTextInput)
  .mount("#app");
