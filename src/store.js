import { createStore } from "vuex";
import fb from "@/firebase.js";

const store = createStore({
  state() {
    return {
      user: {
        authenticated: false,
        data: null,
        admin: false,
        formResponses: [],
      },
      organizations: [],
      forms: {},
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
      commit("mutateUser", { property: "authenticated", with: user !== null });

      if (user) {
        commit("mutateUser", {
          property: "data",
          with: user,
        });
        const formResponses = await fb.getFormResponses(
          user.email,
          user.organization
        );
        commit("mutateUser", {
          property: "formResponses",
          with: formResponses,
        });
        const forms = await fb.getForms();
        commit("mutate", { property: "forms", with: forms });
      } else {
        commit("mutateUser", { property: "data", with: null });
        commit("mutateUser", { property: "formResponses", with: [] });
        commit("mutate", { property: "form", with: {} });
      }
    },
    fetchAdmin({ commit }, admin) {
      commit("mutateUser", { property: "admin", with: admin });
    },
    async fetchOrgs({ commit }) {
      const orgs = await fb.getCollection("organizations");
      commit("mutate", { property: "organizations", with: orgs });
    },
    async updateFormResponse({ commit, state }, updatedFormResponse) {
      const _id = await fb.updateFormResponse(updatedFormResponse, {
        email: state.user.data.email,
        organization: state.user.data.organization,
      });
      const formResponses = [...state.user.formResponses];
      const formResponseIndex = formResponses.findIndex(
        (formResponse) =>
          formResponse._id === _id &&
          formResponse.type === updatedFormResponse.type
      );

      if (formResponseIndex >= 0) {
        formResponses[formResponseIndex] = updatedFormResponse;
      } else {
        formResponses.push({ _id, ...updatedFormResponse });
      }

      commit("mutateUser", { property: "formResponses", with: formResponses });
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
