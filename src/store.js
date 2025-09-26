import { defineStore } from "pinia";
import { getDataset, getModelDataPeriods } from "@/firebase.js";

export const useProvidentStore = defineStore("provident", {
  state: () => {
    return {
      loaded: false,
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
  },
});
