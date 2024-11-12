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
    path: "/login",
    name: "Login",
    beforeEnter: async (to, from) => {
      if (
        !to.query.redirect &&
        !["ResetPassword", "Register"].includes(from.name)
      ) {
        return { path: to.path, query: { redirect: from.path } };
      }
    },
    component: () => import("../views/auth/LoginUser.vue"),
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("../views/auth/RegisterUser.vue"),
  },
  {
    path: "/auth",
    redirect: (to) => {
      const { query } = to;
      if (query.mode === "resetPassword") {
        return { path: "/updatepassword", query: query };
      }
    },
  },
  {
    path: "/updatepassword",
    name: "ResetPassword",
    component: () => import("../views/auth/ResetPassword.vue"),
  },
  {
    path: "/snack",
    name: "Snack",
    beforeEnter: (to) => {
      if (!store.user.authenticated) {
        return { name: "Login", query: { redirect: to.path } };
      }
    },
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
