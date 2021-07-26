import { createStore } from "vuex";
import fb from "@/firebase.js";

const store = createStore({
  state() {
    return {
      user: {
        authenticated: false,
        data: null,
        admin: false,
      },
      organizations: [],
    };
  },

  mutations: {
    mutate(state, payload) {
      state[payload.property] = payload.with;
    },
    mutateUser(state, payload) {
      state.user[payload.property] = payload.with;
    },
  },

  actions: {
    async fetchUser({ commit }, user) {
      if (user) {
        commit("mutateUser", {
          property: "data",
          with: user,
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
    },
  },

  getters: {
    interventionArmUser(state) {
      if (!state.user.authenticated || !state.user.data) {
        return false;
      }

      if (state.organizations.length === 0) {
        return false;
      }

      return state.organizations.find(
        (org) => org.name === state.user.data.organization
      ).intervention_arm;
    },
  },
});

export default store;
