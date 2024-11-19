import { defineStore } from "pinia";
import { getDataset, getModelDataPeriods } from "@/firebase.js";
import utils from "@/utils/utils.js";

export const useProvidentStore = defineStore("provident", {
  state: () => {
    return {
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
});
