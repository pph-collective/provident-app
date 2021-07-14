<template>
  <div class="dashboard p-4">
    <ControlPanel
      v-if="resultPeriods.length > 0"
      data-cy="control-panel"
      :drop-downs="dropDowns"
      @selected="updateControls"
    />

    <Card v-if="controls.geography" width="two-thirds" id="map">
      <template #title>Map: {{ controls.geography.name }}</template>
      <template #subtitle>Some really great insights</template>
      <template #content>
        <div class="map-container">
          <Map
            v-if="dataset.length > 0"
            :dataset="dataset"
            :filter-municipalities="controls.geography.municipalities"
            flag-property="flag_1"
            @new-active-municipality="activeMuni = $event"
            @new-active-bg="activeGeoid = $event"
            :data-cy="controls.geography.name"
          />
        </div>
      </template>
    </Card>

    <Card v-if="dataset.length > 0" width="one-third" id="stats">
      <template #title>Stats from {{ controls.model_version }}</template>
      <template #content>
        <StatsTable
          :dataset="dataset"
          :previous-dataset="previousDataset"
          :municipality="activeMuni"
          :geoid="activeGeoid"
        />
      </template>
    </Card>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";

import Card from "@/components/dashboard/Card.vue";
import ControlPanel from "@/components/dashboard/ControlPanel.vue";
import Map from "@/components/Map.vue";
import StatsTable from "@/components/dashboard/StatsTable.vue";

import fb from "@/firebase.js";

export default {
  components: {
    ControlPanel,
    Map,
    Card,
    StatsTable
  },
  setup() {
    const store = useStore();
    const user = computed(() => store.state.user);
    const dataset = ref([]);
    const previousDataset = ref([]);
    const activeGeoid = ref("");
    const activeMuni = ref("");

    const filteredOrgs = computed(() => {
      const ri = { name: "All of Rhode Island", municipalities: [] };
      const orgs = store.state.organizations;
      if (user.value.admin) {
        return [ri, ...orgs];
      } else {
        return [orgs.find(o => o.name === user.value.data.organization), ri];
      }
    });

    const resultPeriods = ref([]);
    onMounted(async () => {
      resultPeriods.value = await fb.getResultPeriods();
    });

    const dropDowns = computed(() => {
      return {
        geography: {
          icon: "fas fa-globe",
          values: filteredOrgs.value
        },
        model_version: {
          icon: "fas fa-calendar-alt",
          values: resultPeriods.value
        }
      };
    });

    const controls = ref({});

    const updateControls = newControls => {
      // if either drop down changes, clear out the selected block group
      activeMuni.value = "";
      activeGeoid.value = "";

      // update the model data if changed
      if (newControls.model_version !== controls.value.model_version) {
        previousDataset.value = [];
        fb.getResults(newControls.model_version).then(res => {
          dataset.value = res;
        });
        const prevPeriodIdx =
          resultPeriods.value.findIndex(p => p === newControls.model_version) +
          1;
        if (prevPeriodIdx < resultPeriods.value.length) {
          fb.getResults(resultPeriods.value[prevPeriodIdx]).then(res => {
            previousDataset.value = res;
          });
        }
      }

      // update the control selections
      for (const [k, v] of Object.entries(newControls)) {
        controls.value[k] = v;
      }
    };

    return {
      dropDowns,
      controls,
      resultPeriods,
      dataset,
      previousDataset,
      updateControls,
      activeMuni,
      activeGeoid
    };
  }
};
</script>

<style lang="scss" scoped>
@import "bulma";

.map-container {
  max-width: 90vw;
}

.dashboard {
  @extend .px-4;
  @extend .py-4;
  z-index: 20;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: auto;
  column-gap: 15px;
  row-gap: 15px;
  justify-items: stretch;
  align-items: stretch;
  justify-content: space-between;
  align-content: start;
  grid-auto-flow: row;
  @include mobile {
    grid-template-columns: 100vw;
    column-gap: 0px;
    padding-left: 0px;
    padding-right: 0px;
  }
}
</style>
