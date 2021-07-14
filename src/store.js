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
    mutate(state, payload) {
      state[payload.property] = payload.with;
    },
    mutateUser(state, payload) {
      state.user[payload.property] = payload.with;
    }
  },
  actions: {
    async fetchUser({ commit }, user) {
      if (user) {
        commit("mutateUser", {
          property: "data",
          with: user
        });
      } else {
        commit("mutateUser", { property: "data", with: null });
      }
      commit("mutateUser", { property: "authenticated", with: user !== null });
    },
    fetchAdmin({ commit }, admin) {
      commit("mutateUser", { property: "admin", with: admin });
    },
    async fetchOrgs({ commit }) {
      const orgs = await fb.getOrgs();
      commit("mutate", { property: "organizations", with: orgs });
    }
  }
});

export default store;
