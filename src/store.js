import { createStore } from "vuex";
import fb from "@/firebase.js";

const store = createStore({
  state() {
    return {
      user: {
        authenticated: false,
        data: null,
        admin: false
      },
      organizations: []
    };
  },
  mutations: {
    SET_LOGGED_IN(state, value) {
      state.user.authenticated = value;
    },
    SET_USER(state, data) {
      state.user.data = data;
    },
    SET_ADMIN(state, admin) {
      state.user.admin = admin;
    },
    SET_ORGS(state, orgs) {
      state.organizations = orgs;
    }
  },
  actions: {
    async fetchUser({ commit }, user) {
      if (user) {
        commit("SET_USER", {
          ...user
        });
      } else {
        commit("SET_USER", null);
      }
      commit("SET_LOGGED_IN", user !== null);
    },
    fetchAdmin({ commit }, admin) {
      commit("SET_ADMIN", admin);
    },
    async fetchOrgs({ commit }) {
      const orgs = await fb.getOrgs();
      commit("SET_ORGS", orgs);
    }
  }
});

export default store;
