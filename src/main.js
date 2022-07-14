// Set up Vue
import { createApp } from "vue";
import App from "./App.vue";

import store from "./store";
import router from "./router";
import fb from "@/firebase";

// general styling
import "@/assets/styles/main.scss";

// form components - needed globally
import FormCheckbox from "@/components/form/Checkbox.vue";
import FormDate from "@/components/form/Date.vue";
import FormLikertScale from "@/components/form/LikertScale.vue";
import FormRadio from "@/components/form/Radio.vue";
import FormSelect from "@/components/form/Select.vue";
import FormTextArea from "@/components/form/TextArea.vue";
import FormTextInput from "@/components/form/TextInput.vue";
import FormSubForm from "@/components/form/SubForm.vue";

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
      store.dispatch("fetchModelData");
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
