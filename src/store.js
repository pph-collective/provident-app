import { createStore } from "vuex";
import fb from "@/firebase.js";
import utils from "@/utils/utils.js";
import { createFollowupFormResponse } from "@/utils/followupForm.js";

const store = createStore({
  state() {
    return {
      user: {
        authenticated: false,
        data: null,
        admin: false,
        formResponses: [],
        loaded: true,
      },
      formAssignments: [],
      forms: {},
      organizations: [],
      users: [],
      loaded: false,
      notifications: [],
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
    fetchUser({ commit, dispatch }, user) {
      commit("mutateUser", { property: "loaded", with: false });
      commit("mutateUser", { property: "authenticated", with: user !== null });

      // always start empty, controlled by ContentWithSidebar
      commit("mutate", { property: "users", with: [] });
      commit("mutate", { property: "formAssignments", with: [] });
      commit("mutate", { property: "notifications", with: [] });

      if (user) {
        Promise.all([
          commit("mutateUser", { property: "data", with: user }),
          dispatch("updateUserFormResponses"),
          fb.getForms().then((forms) => {
            commit("mutate", { property: "forms", with: forms });
          }),
        ]).then(() => {
          commit("mutateUser", { property: "loaded", with: true });
        });
      } else {
        commit("mutateUser", { property: "data", with: null });
        commit("mutateUser", { property: "formResponses", with: [] });
        commit("mutate", { property: "forms", with: {} });
        commit("mutateUser", { property: "loaded", with: true });
      }
    },
    async updateUserFormResponses({ commit, state }) {
      const formResponses = await fb.getFormResponses(
        state.user.data.email,
        state.user.data.organization
      );
      commit("mutateUser", {
        property: "formResponses",
        with: formResponses,
      });
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
    async addOrg({ commit, state }, organization) {
      // Setting _id to be more consistent to getCollection in firebase.js
      organization._id = await fb.addOrg(organization);

      commit("mutate", {
        property: "organizations",
        with: [organization, ...state.organizations],
      });
    },
    async updateFormResponse({ commit, state }, updatedFormResponse) {
      updatedFormResponse._id = await fb.updateFormResponse(
        updatedFormResponse,
        {
          email: state.user.data.email,
          organization: state.user.data.organization,
        }
      );

      const formResponses = [...state.user.formResponses];
      const formResponseIndex = formResponses.findIndex(
        (formResponse) =>
          formResponse._id === updatedFormResponse._id &&
          formResponse.type === updatedFormResponse.type
      );

      if (formResponseIndex >= 0) {
        formResponses[formResponseIndex] = updatedFormResponse;
      } else {
        formResponses.push(updatedFormResponse);
      }

      // Follow up form
      if (
        updatedFormResponse.status === "Submitted" &&
        updatedFormResponse.form.followup_form !== undefined
      ) {
        const followupFormResponse =
          createFollowupFormResponse(updatedFormResponse);
        followupFormResponse._id = await fb.updateFormResponse(
          followupFormResponse,
          {
            email: state.user.data.email,
            organization: state.user.data.organization,
          }
        );
        formResponses.push(followupFormResponse);

        const { release_date, form } = followupFormResponse;
        const { title, type } = form;
        const body = `<p>A followup form, <em>${title}</em>, has been assigned to ${
          type === "user" ? "you" : "your organization"
        }. Check out the form on <a href='${
          location.origin
        }/snack/forms'>PROVIDENT</a>.</p>`;

        await fb.createEmail({
          to: updatedFormResponse.users_edited,
          send_date: release_date,
          subject: `PROVIDENT Followup Form: ${title}`,
          body,
        });
      }

      commit("mutateUser", { property: "formResponses", with: formResponses });
      return updatedFormResponse._id;
    },
    updateUsers({ commit }, users) {
      commit("mutate", { property: "users", with: users });
    },
    async getFormAssignments({ commit }) {
      const formAssignments = await fb.getCollection("form_assignments");
      commit("mutate", { property: "formAssignments", with: formAssignments });
    },
    addFormAssignment({ commit, state }, formAssignment) {
      commit("mutate", {
        property: "formAssignments",
        with: [formAssignment, ...state.formAssignments],
      });
    },
    setLoaded({ commit }) {
      commit("mutate", { property: "loaded", with: true });
    },
    addNotification(
      { commit, dispatch, state },
      { color = "success", message }
    ) {
      const id = utils.uniqueId();
      commit("mutate", {
        property: "notifications",
        with: [...state.notifications, { id, color, message }],
      });
      setTimeout(() => dispatch("dismissNotification", id), 6000);
    },
    dismissNotification({ commit, state }, id) {
      commit("mutate", {
        property: "notifications",
        with: state.notifications.filter((n) => n.id != id),
      });
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
