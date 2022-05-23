import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import ContentWithSidebar from "../views/ContentWithSidebar.vue";
import store from "@/store";

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
    component: () => import("../views/auth/Login.vue"),
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("../views/auth/Register.vue"),
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
      if (!store.state.user.authenticated) {
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
        path: "forms",
        component: () => import("../views/snack/Forms.vue"),
      },
      {
        path: "dashboard",
        component: () => import("../views/snack/Dashboard.vue"),
      },
    ],
  },
  {
    path: "/admin",
    name: "Admin",
    beforeEnter: (to) => {
      if (!store.state.user.authenticated) {
        return { name: "Login", query: { redirect: to.path } };
      } else if (!store.state.user.admin) {
        return { name: "Home" };
      }
    },
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: ContentWithSidebar,
    props: {
      parentRoute: "admin",
      pages: [
        {
          name: "Review Access Requests",
          route: "review_access_requests",
          icon: "fa-universal-access",
        },
        {
          name: "User Management",
          route: "user_management",
          icon: "fa-crown",
        },
        {
          name: "Organization Management",
          route: "organization_management",
          icon: "fa-handshake",
        },
        {
          name: "Form Assignments",
          route: "form_assignments",
          icon: "fa-file-import",
        },
        {
          name: "Emails",
          route: "email",
          icon: "fa-paper-plane",
        },
      ],
    },
    children: [
      {
        path: "",
        redirect: "/admin/review_access_requests",
      },
      {
        path: "review_access_requests",
        component: () => import("../views/admin/ReviewAccessRequests.vue"),
      },
      {
        path: "user_management",
        component: () => import("../views/admin/UserManagement.vue"),
      },
      {
        path: "organization_management",
        component: () => import("../views/admin/OrganizationManagement.vue"),
      },
      {
        path: "form_assignments",
        component: () => import("../views/admin/FormAssignments.vue"),
      },
      {
        path: "email",
        component: () => import("../views/admin/Emails.vue"),
      },
    ],
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
    } else {
      return { top: 0, behavior: "smooth" };
    }
  },
});

router.beforeEach(async () => {
  while (!store.state.loaded) {
    await sleep(20);
  }
});

export default router;
