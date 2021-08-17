<template>
  <div class="dashboard p-4 container is-fullhd">
    <ControlPanel
      v-if="resultPeriods.length > 0"
      id="dashboard-control-panel"
      :drop-downs="dropDowns"
      @selected="updateControls"
    />

    <Card v-if="controls.geography" width="two-thirds" id="map">
      <template #title>Map: {{ controls.geography.name }}</template>
      <template #top-right>
        <button
          v-if="!zoomed"
          :disabled="!activeGeoid"
          class="zoom-button button is-family-secondary is-info is-light"
          @click="zoomed = true"
        >
          <span class="icon">
            <i class="fas fa-search-plus"></i>
          </span>
          <span>Zoom to Block Group</span>
        </button>
        <button
          v-else
          class="zoom-button button is-family-secondary is-info is-light"
          @click="zoomed = false"
        >
          <span class="icon">
            <i class="fas fa-search-minus"></i>
          </span>
          <span>Zoom Back Out</span>
        </button>
      </template>
      <template #subtitle>Some really great insights</template>
      <template #content>
        <div class="map-container">
          <Map
            id="main-map"
            v-if="dataset.length > 0"
            class="is-absolute"
            :dataset="dataset"
            :filter-municipalities="controls.geography.municipalities"
            flag-property="flag_1"
            :with-predictions="interventionArmUser"
            @new-active-municipality="activeMuni = $event"
            @new-active-bg="activeGeoid = $event"
            :data-cy="controls.geography.name"
          />
          <BGMap
            id="bg-zoom-map"
            v-if="activeGeoid && zoomed"
            :block-group="activeGeoid"
            class="is-absolute"
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
          :with-predictions="interventionArmUser"
        />
      </template>
    </Card>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import * as aq from "arquero";

import Card from "@/components/dashboard/Card.vue";
import ControlPanel from "@/components/dashboard/ControlPanel.vue";
import Map from "@/components/dashboard/Map.vue";
import BGMap from "@/components/dashboard/BGMap.vue";
import StatsTable from "@/components/dashboard/StatsTable.vue";

import fb from "@/firebase.js";

export default {
  components: {
    ControlPanel,
    Map,
    BGMap,
    Card,
    StatsTable,
  },
  setup() {
    const store = useStore();
    const user = computed(() => store.state.user);
    const interventionArmUser = computed(
      () => store.getters.interventionArmUser
    );
    const dataset = ref([]);
    const previousDataset = ref([]);
    const activeGeoid = ref("");
    const activeMuni = ref("");
    const zoomed = ref(false);

    const filteredOrgs = computed(() => {
      const ri = { name: "All of Rhode Island", municipalities: [] };
      const orgs = store.state.organizations;
      const towns = [];
      dataset.value.forEach((d) => {
        if (
          d.municipality &&
          !towns.some((town) => d.municipality === town.name)
        ) {
          towns.push({
            name: d.municipality,
            municipalities: [d.municipality],
          });
        }
      });
      towns.sort((a, b) => (a.name < b.name ? -1 : 1));
      if (user.value.admin) {
        return [ri, ...orgs, ...towns];
      } else {
        return [
          orgs.find((o) => o.name === user.value.data.organization),
          ri,
          ...towns,
        ];
      }
    });

    const resultPeriods = ref([]);
    onMounted(async () => {
      resultPeriods.value = await fb.getModelDataPeriods();
    });

    const dropDowns = computed(() => {
      return {
        geography: {
          icon: "fas fa-globe",
          values: filteredOrgs.value,
        },
        model_version: {
          icon: "fas fa-calendar-alt",
          values: resultPeriods.value,
        },
      };
    });

    const controls = ref({});

    const updateDataset = async (period) => {
      const data = await fb.getModelData(period);
      if (interventionArmUser.value) {
        const preds = await fb.getModelPredictions(period);
        return aq.from(data).join_left(aq.from(preds), "bg_id").objects();
      } else {
        return data;
      }
    };

    const updateControls = (newControls) => {
      // if either drop down changes, clear out the selected block group
      activeMuni.value = "";
      activeGeoid.value = "";
      zoomed.value = false;

      // update the model data if changed
      if (newControls.model_version !== controls.value.model_version) {
        previousDataset.value = [];
        updateDataset(newControls.model_version).then((res) => {
          dataset.value = res;
        });
        const prevPeriodIdx =
          resultPeriods.value.findIndex(
            (p) => p === newControls.model_version
          ) + 1;
        if (prevPeriodIdx < resultPeriods.value.length) {
          updateDataset(resultPeriods.value[prevPeriodIdx]).then((res) => {
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
      activeGeoid,
      interventionArmUser,
      zoomed,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "bulma";

.map-container {
  max-width: 90vw;
  height: 80vh;
  max-height: 1280px;
  position: relative;
}

.is-absolute {
  position: absolute;
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

.zoom-button {
  min-width: 220px;
}
</style>
