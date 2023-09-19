// Set up Vue
import { createApp } from "vue";
import App from "./App.vue";

import store from "./store";
import router from "./router";
import { auth, getUserRequest, logActivity } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

// general styling
import "@/assets/styles/main.scss";

// form components - needed globally
import FormCheckbox from "@/components/form/CheckboxInput.vue";
import FormDate from "@/components/form/DateInput.vue";
import FormLikertScale from "@/components/form/LikertScale.vue";
import FormRadio from "@/components/form/RadioInput.vue";
import FormSelect from "@/components/form/SelectInput.vue";
import FormTextArea from "@/components/form/TextArea.vue";
import FormTextInput from "@/components/form/TextInput.vue";
import FormSubForm from "@/components/form/SubForm.vue";

// listen for changes to user
onAuthStateChanged(auth, async (user) => {
  await store.dispatch("fetchOrgs");

  if (user) {
    const { status, organization, role } = await getUserRequest(user.email);
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
      logActivity(user.email, "login");
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
