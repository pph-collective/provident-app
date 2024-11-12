import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/HomePage.vue";
import Resources from "../views/ResourcesPage.vue";
import { useProvidentStore } from "../store";

let store = {};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/snack",
    name: "Snack",
    component: () => import("../views/PassThrough.vue"),
    children: [
      {
        path: "",
        redirect: "/snack/dashboard",
      },
      {
        path: "dashboard",
        component: () => import("../views/snack/DashboardPage.vue"),
      },
    ],
  },
  {
    path: "/resources",
    name: "Resources",
    component: Resources,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: "smooth",
      };
    }
  },
});

router.beforeEach(async () => {
  store = useProvidentStore();

  while (!store.loaded) {
    await sleep(20);
  }
});

export default router;
