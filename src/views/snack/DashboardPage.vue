<template>
  <LoadingSpinner :loading="loading" />
  <div class="dashboard container is-fullhd">
    <ControlPanel
      v-if="displayControlPanel"
      id="dashboard-control-panel"
      :drop-downs="dropDowns"
      @selected="updateControls"
    />

    <DashboardCard
      id="map"
      style="align-self: start"
      width="two-thirds"
      :height="5"
    >
      <template #title>
        Map:
        {{
          zoomed
            ? `${computedMuni} - ${activeBG}`
            : controls?.geography?.name ?? ""
        }}
      </template>
      <template #top-right>
        <div class="field is-grouped">
          <p class="control">
            <button
              v-if="!zoomed"
              :disabled="!activeBG || !activeClickedStatus"
              class="zoom-button button is-family-secondary is-secondary is-light"
              @click="zoomBg"
            >
              <span class="icon">
                <i class="fas fa-search-plus" />
              </span>
              <span>Zoom to Block Group</span>
            </button>
            <button
              v-else
              class="zoom-button button is-family-secondary is-secondary is-light"
              @click="zoomed = false"
            >
              <span class="icon">
                <i class="fas fa-search-minus" />
              </span>
              <span>Zoom Back Out</span>
            </button>
          </p>
        </div>
      </template>
      <template #subtitle>
        <div v-if="!zoomed">
          <div v-if="interventionArmUser">
            <div class="icon-text">
              <div class="is-flex is-flex-direction-row">
                <div class="icon solid-square" />
                <p>Prioritized by PROVIDENT model</p>
              </div>
            </div>
            <div class="icon-text">
              <div class="is-flex is-flex-direction-row">
                <div class="icon square" />
                <span>Not prioritized by PROVIDENT model</span>
              </div>
            </div>
            <div class="icon-text">
              <div class="is-flex is-flex-direction-row">
                <div class="icon stripes square" />
                <span>Not eligible for PROVIDENT prediction</span>
              </div>
            </div>
          </div>
          Click on a block group to see more details or zoom in
        </div>
      </template>
      <template #content>
        <div v-if="controls.geography" class="map-container">
          <MainMap
            v-if="dataset.cbg.length > 0"
            id="main-map"
            class="is-absolute"
            :dataset="dataset.cbg"
            :filter-municipalities="controls.geography.municipalities"
            flag-property="prediction"
            :with-predictions="interventionArmUser"
            :zipcode="controls.zipcode"
            :data-cy="controls.geography.name"
            :active-block-group="activeBG"
            @new-active-bg="activeBG = $event"
            @active-clicked-status="clickMap"
          />
          <BGMap
            v-if="activeBG && zoomed"
            id="bg-zoom-map"
            :block-group="activeBG"
            :dataset="dataset.cbg"
            class="is-absolute"
          />
          <div v-if="activeBG && zoomed" class="instructions is-size-6-7">
            Click on a <i class="fas fa-circle point-of-interest" /> point of
            interest to copy the address to your clipboard
          </div>
        </div>
      </template>
    </DashboardCard>

    <DashboardCard id="stats" width="one-third" :height="5">
      <template #title> Stats: {{ modelDataPeriod.version }}</template>
      <template v-if="modelDataPeriod.description" #subtitle>
        {{ modelDataPeriod.description }}</template
      >
      <template #content>
        <StatsWidget
          v-if="dataset.cbg.length > 0"
          :dataset="dataset"
          :municipality="computedMuni"
          :geoid="activeBG"
          :with-predictions="interventionArmUser"
        />
      </template>
    </DashboardCard>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { useProvidentStore } from "../../store";

import geo from "@/assets/geojson/ri.json";

import { logActivity, getZipcodes } from "../../firebase.js";
import { MUNICIPALITIES, sortByProperty } from "../../utils/utils";

import DashboardCard from "../../components/dashboard/DashboardCard.vue";
import ControlPanel from "../../components/dashboard/ControlPanel.vue";
import MainMap from "../../components/dashboard/MainMap.vue";
import BGMap from "../../components/dashboard/BGMap.vue";
import StatsWidget from "../../components/dashboard/StatsWidget.vue";
import LoadingSpinner from "../../components/LoadingSpinner.vue";
import { useQueryParams } from "../../composables/useQueryParams";

const towns = MUNICIPALITIES.map((m) => ({
  name: m,
  municipalities: [m],
}));

const BLOCK_GROUPS = geo.map((feature) => ({
  municipality: feature.properties.name,
  blockGroup: feature.properties.bg_id,
}));

const store = useProvidentStore();
const interventionArmUser = computed(() => store.interventionArmUser);
const dataset = computed(() => {
  if (store.dataset.cbg.length === 0) {
    store.fetchModelData();
  }

  return store.dataset;
});
const activeBG = ref("");
const computedMuni = computed(() => {
  const bg = BLOCK_GROUPS.find(
    ({ blockGroup }) => blockGroup === activeBG.value,
  );
  if (bg) return bg.municipality;
  return "";
});
const activeClickedStatus = ref(false);
const zoomed = ref(false);

const filteredOrgs = computed(() => {
  const ri = { name: "All of Rhode Island", municipalities: [] };
  const orgs = store.organizations;
  if (store.user.admin) {
    return [ri, ...orgs, ...towns];
  } else if (store.user.data) {
    return [
      orgs.find((o) => o.name === store.user.data.organization),
      ri,
      ...towns,
    ];
  } else {
    // shouldn't hit here in reality
    return [ri, ...towns];
  }
});

const modelDataPeriod = computed(() => store.modelDataPeriod);
const displayControlPanel = computed(
  () => Object.keys(modelDataPeriod).length !== 0,
);

const zipcodes = ref([]);

onMounted(async () => {
  zipcodes.value = await getZipcodes();
});

const zipsDropdownOptions = computed(() => {
  let zips = [];

  if (controls.value.geography) {
    const { municipalities } = controls.value.geography;

    if (municipalities.length === 0) {
      // Set the result (for the dropdown) to all of the zip codes in RI
      zips = zipcodes.value;
    } else {
      municipalities.forEach((m) => {
        zips.push(...zipcodes.value.filter((z) => z.city === m));
      });
    }

    zips = zips
      .map((z) => {
        const { alias } = z;
        const formatAlias = alias ? ` (${alias})` : "";

        return {
          ...z,
          name: `${z.zip}${formatAlias}`,
        };
      })
      .sort(sortByProperty("zip"));
  }

  return [{ name: "All Zip Codes" }, ...zips];
});

const dropDowns = computed(() => {
  return {
    geography: {
      icon: "fas fa-globe",
      values: filteredOrgs.value,
    },
    zipcode: {
      icon: "fas fa-map",
      values: zipsDropdownOptions.value,
    },
  };
});

const controls = ref({
  geography: filteredOrgs.value[0], // All Towns
  zipcode: { name: "All Zip Codes" },
});

const updateControls = (newControls) => {
  // If the dropdown changes, clear the selected block group.
  if (
    controls.value.geography !== newControls.geography ||
    controls.value.zipcode.name !== newControls.zipcode.name
  ) {
    activeBG.value = "";
    zoomed.value = false;
  }

  // resets the zipcode dropdown to All Zip Codes
  if (newControls.geography !== controls.value.geography) {
    newControls.zipcode = zipsDropdownOptions.value[0];
  }

  // update the control selections
  for (const [k, v] of Object.entries(newControls)) {
    controls.value[k] = v;
  }
};

useQueryParams([
  {
    param: "bg",
    ref: activeBG,
    refField: undefined,
    valid: () => true,
    push: true,
    getInitParam: () => "",
  },
  {
    param: "zoomed",
    ref: zoomed,
    refField: undefined,
    valid: (val) =>
      val.toString().toLowerCase() === "true" ||
      val.toString().toLowerCase() === "false",
    paramToVal: (param) => {
      const paramAsString = param.toString().toLowerCase();
      if (paramAsString === "true") return true;
      if (paramAsString === "false") return false;
      throw new Error("Invalid value for 'zoomed' param");
    },
    valToParam: (val) => (val ? "true" : "false"),
    getInitParam: () => "false",
  },
]);

const loading = computed(
  () => dataset.value.cbg.length === 0 || !displayControlPanel.value,
);

// TODO: the timing of the click signal listener and the active Geography signal listener make this not always right
const clickMap = (clickedStatus) => {
  activeClickedStatus.value = clickedStatus;
  if (clickedStatus) {
    // wait for the next render cycle as the activeBG gets updated at about the
    // same time and otherwise could be stale
    nextTick(() =>
      logActivity(store.user.data.email, "click map", activeBG.value),
    );
  }
};

const zoomBg = () => {
  zoomed.value = true;
  logActivity(store.user.data.email, "zoom map", activeBG.value);
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/main.scss";

.map-container {
  max-width: 95vw;
  height: 80vh;
  max-height: 1280px;
  position: relative;
}

.is-absolute {
  position: absolute;
}

.dashboard {
  padding: 1rem;
  z-index: 5;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: auto;
  column-gap: 15px;
  row-gap: 15px;
  justify-items: stretch;
  align-items: stretch;
  align-content: start;
  grid-auto-flow: row dense;
  @include mobile {
    grid-template-columns: 100%;
    column-gap: 0px;
    padding: 5px;
    row-gap: 5px;
  }
  @include tablet-only {
    grid-template-columns: repeat(2, 1fr);
    column-gap: 5px;
    padding: 5px;
    row-gap: 5px;
  }
}

.zoom-button {
  min-width: 220px;
}

.instructions {
  position: absolute;
  top: 0;
  padding: 4px 2px;
  margin: 6px 6px 0px;
  background-color: hsl(0deg 0% 100% / 60%);
}

.square {
  width: 20px;
  height: 20px;
  border-radius: 3px;
  border-color: black;
  border-width: 1px;
  border-style: solid;
}

.solid-square {
  @extend .square;
  background-color: $pori-blue;
  opacity: 0.5;
}

.point-of-interest {
  color: $pori-red;
}
</style>
