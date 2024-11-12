// Set up Vue
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";

import { useProvidentStore } from "./store";
import router from "./router";
import { auth, getUserRequest } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

// general styling
import "@/assets/styles/main.scss";

const pinia = createPinia();

createApp(App).use(router).use(pinia).mount("#app");

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
      store.setLoaded();
      return;
    }
  }

  // fallthrough
  store.fetchUser(null);
  store.setLoaded();
});
