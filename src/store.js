import { createStore } from "vuex";
import fb from "@/firebase.js";
import utils from "@/utils/utils.js";

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
      users: [],
      formAssignments: [],
      loaded: false,
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
    fetchUser({ commit }, user) {
      commit("mutateUser", { property: "authenticated", with: user !== null });

      // always start empty, controlled by ContentWithSidebar
      commit("mutate", { property: "users", with: [] });
      commit("mutate", { property: "formAssignments", with: [] });

      if (user) {
        commit("mutateUser", {
          property: "data",
          with: user,
        });
        fb.getFormResponses(user.email, user.organization).then(
          (formResponses) => {
            commit("mutateUser", {
              property: "formResponses",
              with: formResponses,
            });
          }
        );

        fb.getForms().then((forms) => {
          commit("mutate", { property: "forms", with: forms });
        });
      } else {
        commit("mutateUser", { property: "data", with: null });
        commit("mutateUser", { property: "formResponses", with: [] });
        commit("mutate", { property: "forms", with: {} });
      }
    },
    fetchAdmin({ commit }, admin) {
      commit("mutateUser", { property: "admin", with: admin });
    },
    async fetchOrgs({ commit, state }) {
      if (state.organizations.length === 0) {
        const orgs = await fb.getCollection("organizations");
        commit("mutate", { property: "organizations", with: orgs });
      }
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

      return _id;
    },
    updateUsers({ commit }, users) {
      commit("mutate", { property: "users", with: users });
    },
    async getFormAssignments({ commit }) {
      const formAssignments = await fb.getCollection("form_assignments");
      commit("mutate", { property: "formAssignments", with: formAssignments });
    },
    setLoaded({ commit }) {
      commit("mutate", { property: "loaded", with: true });
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
    pendingUsers(state) {
      return state.users.filter((user) => user.status === "pending");
    },
    approvedUsers(state) {
      return state.users.filter((user) => user.status === "approved");
    },
    formUserOptions(state) {
      return state.users
        .map((u) => {
          return { value: u.email, label: `${u.name} (${u.email})` };
        })
        .sort(utils.sortByProperty("label"));
    },
    formOrganizationOptions(state) {
      return state.organizations.map((org) => org.name).sort();
    },
  },
});

export default store;
