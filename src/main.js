// Set up Vue
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";

import { useProvidentStore } from "./store";
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

const pinia = createPinia();
const store = useProvidentStore();

// listen for changes to user
onAuthStateChanged(auth, async (user) => {
  await store.fetchOrgs();

  if (user) {
    const { status, organization, role } = await getUserRequest(user.email);
    if (status === "approved") {
      store.fetchUser({
        ...user.toJSON(),
        status,
        organization,
        role,
      });
      let token = await user.getIdTokenResult();
      store.fetchAdmin(token.claims && token.claims.admin);
      // purposefully not waiting for logging to complete
      logActivity(user.email, "login");
      store.setLoaded();
      return;
    }
  }

  // fallthrough
  store.fetchUser(null);
  store.fetchAdmin(false);
  store.setLoaded();
});

createApp(App)
  .use(router)
  .use(pinia)
  .component("FormCheckbox", FormCheckbox)
  .component("FormDate", FormDate)
  .component("FormLikertScale", FormLikertScale)
  .component("FormRadio", FormRadio)
  .component("FormSelect", FormSelect)
  .component("FormSubForm", FormSubForm)
  .component("FormTextArea", FormTextArea)
  .component("FormTextInput", FormTextInput)
  .mount("#app");
