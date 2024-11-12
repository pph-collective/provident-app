import { defineStore } from "pinia";
import { getCollection, getDataset, getModelDataPeriods } from "@/firebase.js";
import utils from "@/utils/utils.js";

export const useProvidentStore = defineStore("provident", {
  state: () => {
    return {
      user: {
        authenticated: false,
        data: null,
        admin: false,
        loaded: true,
      },
      organizations: [],
      users: [],
      loaded: false,
      notifications: [],
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
      this.mutate({ property: "notifications", with: [] });

      if (user) {
        this.mutateUser({ property: "data", with: user });
        this.mutateUser({ property: "loaded", with: true });
      } else {
        this.mutateUser({ property: "data", with: null });
        this.mutateUser({ property: "loaded", with: true });
      }
    },
    async fetchModelData() {
      const modelDataPeriods = await getModelDataPeriods();
      const { version, description } = modelDataPeriods[0];

      const dataset = await getDataset(version);

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
    updateUsers(users) {
      this.mutate({ property: "users", with: users });
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
    pendingUsers: (state) => {
      return state.users.filter((user) => user.status === "pending");
    },
    approvedUsers: (state) => {
      return state.users.filter((user) => user.status === "approved");
    },
  },
});
