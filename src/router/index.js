import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import store from "@/store";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/login",
    name: "Login",
    beforeEnter: (to, from) => {
      if (!to.query.redirect) {
        return { path: to.path, query: { redirect: from.path } };
      }
    },
    component: () =>
      import(/* webpackChunkName: "login" */ "../views/Login.vue")
  },
  {
    path: "/register",
    name: "Register",
    component: () =>
      import(/* webpackChunkName: "register" */ "../views/Register.vue")
  },
  {
    path: "/auth",
    redirect: to => {
      const { query } = to;
      if (query.action === "resetPassword") {
        return { path: "/updatepassword", query: query };
      }
    }
  },
  {
    path: "/updatepassword",
    name: "ResetPassword",
    component: () =>
      import(/* webpackChunkName: "register" */ "../views/ResetPassword.vue")
  },
  {
    path: "/snack",
    name: "Snack",
    beforeEnter: to => {
      console.log(store.state.user);
      if (!store.state.user.authenticated) {
        return { name: "Login", query: { redirect: to.path } };
      }
    },
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "snack" */ "../views/Snack.vue"),
    children: [
      {
        path: "forms",
        component: () =>
          import(/* webpackChunkName: "snack" */ "../components/SnackForms.vue")
      },
      {
        path: "dashboard",
        component: () =>
          import(/* webpackChunkName: "snack" */ "../components/Dashboard.vue")
      }
    ]
  },
  {
    path: "/admin",
    name: "Admin",
    beforeEnter: to => {
      if (!store.state.user.authenticated || !store.state.user.admin) {
        return { name: "Login", query: { redirect: to.path } };
      }
    },
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "admin" */ "../views/Admin.vue")
  },
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue")
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: "smooth"
      };
    } else {
      return { top: 0, behavior: "smooth" };
    }
  }
});

export default router;
