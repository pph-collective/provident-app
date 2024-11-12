// Set up Vue
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";

import { useProvidentStore } from "./store";
import router from "./router";

// general styling
import "@/assets/styles/main.scss";

const pinia = createPinia();

createApp(App).use(router).use(pinia).mount("#app");

const store = useProvidentStore();
store.setLoaded();
