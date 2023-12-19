import { defineStore } from "pinia";
import {
  addOrg,
  createEmail,
  getCollection,
  getDataset,
  getForms,
  getFormResponses,
  getModelDataPeriods,
  updateFormResponse,
} from "@/firebase.js";
import utils from "@/utils/utils.js";
import { createFollowupFormResponse } from "@/utils/followupForm.js";

export const useProvidentStore = defineStore("provident", {
  state: () => {
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
      allFormResponses: [],
      modelDataPeriod: {},
      dataset: {
        cbg: [],
        town: [],
        ri: [],
      },
    };
  },

  actions: {
    mutate(payload) {
      this[payload.property] = payload.with;
    },
    mutateUser(payload) {
      this.user[payload.property] = payload.with;
    },

    fetchUser(user) {
      this.mutateUser({ property: "loaded", with: false });
      this.mutateUser({ property: "authenticated", with: user !== null });

      // always start empty, controlled by ContentWithSidebar
      this.mutate({ property: "users", with: [] });
      this.mutate({ property: "formAssignments", with: [] });
      this.mutate({ property: "notifications", with: [] });

      if (user) {
        this.mutateUser({ property: "data", with: user });
        Promise.all([
          this.updateUserFormResponses(),
          getForms().then((forms) => {
            this.mutate({ property: "forms", with: forms });
          }),
        ]).then(() => {
          this.mutateUser({ property: "loaded", with: true });
        });
      } else {
        this.mutateUser({ property: "data", with: null });
        this.mutateUser({ property: "formResponses", with: [] });
        this.mutate({ property: "forms", with: {} });
        this.mutateUser({ property: "loaded", with: true });
      }
    },
    async updateUserFormResponses() {
      const formResponses = await getFormResponses(
        this.user.data.email,
        this.user.data.organization,
      );
      this.mutateUser({
        property: "formResponses",
        with: formResponses,
      });
    },
    fetchAdmin(admin) {
      this.mutateUser({ property: "admin", with: admin });
    },
    async fetchModelData() {
      const modelDataPeriods = await getModelDataPeriods();
      const { version, description } = modelDataPeriods[0];
      const interventionArmUser = this.interventionArmUser;

      const dataset = await getDataset(version, interventionArmUser);

      this.mutate({
        property: "modelDataPeriod",
        with: { version, description },
      });
      this.mutate({ property: "dataset", with: dataset });
    },
    async fetchOrgs() {
      if (this.organizations.length === 0) {
        const orgs = await getCollection("organizations");
        this.mutate({ property: "organizations", with: orgs });
      }
    },
    async addOrg(organization) {
      // Setting _id to be more consistent to getCollection in firebase.js
      organization._id = await addOrg(organization);

      this.mutate({
        property: "organizations",
        with: [organization, ...this.organizations],
      });
    },
    async updateFormResponse(updatedFormResponse) {
      updatedFormResponse._id = await updateFormResponse(updatedFormResponse, {
        email: this.user.data.email,
        organization: this.user.data.organization,
      });

      const formResponses = [...this.user.formResponses];
      const formResponseIndex = formResponses.findIndex(
        (formResponse) =>
          formResponse._id === updatedFormResponse._id &&
          formResponse.type === updatedFormResponse.type,
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
        followupFormResponse._id = await updateFormResponse(
          followupFormResponse,
          {
            email: this.user.data.email,
            organization: this.user.data.organization,
          },
        );
        formResponses.push(followupFormResponse);

        const { release_date, form } = followupFormResponse;
        const { title, type } = form;
        const body = `<p>A followup form, <em>${title}</em>, has been assigned to ${
          type === "user" ? "you" : "your organization"
        }. Check out the form on <a href='${
          location.origin
        }/snack/forms'>PROVIDENT</a>.</p>`;

        await createEmail({
          to: updatedFormResponse.users_edited,
          send_date: release_date,
          subject: `PROVIDENT Followup Form: ${title}`,
          body,
        });
      }

      this.mutateUser({ property: "formResponses", with: formResponses });
      return updatedFormResponse._id;
    },
    updateAllFormResponses(formResponses) {
      this.mutate({ property: "allFormResponses", with: formResponses });
    },
    updateUsers(users) {
      this.mutate({ property: "users", with: users });
    },
    async getFormAssignments() {
      const formAssignments = await getCollection("form_assignments");
      this.mutate({ property: "formAssignments", with: formAssignments });
    },
    addFormAssignment(formAssignment) {
      this.mutate({
        property: "formAssignments",
        with: [formAssignment, ...this.formAssignments],
      });
    },
    setLoaded() {
      this.mutate({ property: "loaded", with: true });
    },
    addNotification({ color = "success", message }) {
      const id = utils.uniqueId();
      this.mutate({
        property: "notifications",
        with: [...this.notifications, { id, color, message }],
      });
      setTimeout(() => this.dismissNotification(id), 6000);
    },
    dismissNotification(id) {
      this.mutate({
        property: "notifications",
        with: this.notifications.filter((n) => n.id !== id),
      });
    },
  },

  getters: {
    interventionArmUser: (state) => {
      if (!state.user.authenticated || !state.user.data) {
        return false;
      }

      if (state.organizations.length === 0) {
        return false;
      }

      return state.organizations.find(
        (org) => org.name === state.user.data.organization,
      ).intervention_arm;
    },
    pendingUsers: (state) => {
      return state.users.filter((user) => user.status === "pending");
    },
    approvedUsers: (state) => {
      return state.users.filter((user) => user.status === "approved");
    },
    formUserOptions: (state) => {
      return state.users
        .map((u) => {
          return { value: u.email, label: `${u.name} (${u.email})` };
        })
        .sort(utils.sortByProperty("label"));
    },
    formOrganizationOptions: (state) => {
      return state.organizations.map((org) => org.name).sort();
    },
  },
});
