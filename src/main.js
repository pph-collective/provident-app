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
      await store.dispatch("fetchUser", {
        ...user.toJSON(),
        status,
        organization,
        role,
      });
      let token = await user.getIdTokenResult();
      await store.dispatch("fetchAdmin", token.claims && token.claims.admin);
      // purposefully not waiting for logging to complete
      await fb.logActivity(user.email, "login");
      await store.dispatch("setLoaded");
      return;
    }
  }

  // fallthrough
  await store.dispatch("fetchUser", null);
  await store.dispatch("fetchAdmin", false);
  await store.dispatch("setLoaded");
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
