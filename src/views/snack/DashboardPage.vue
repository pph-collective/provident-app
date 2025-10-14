<template>
  <LoadingSpinner :loading="loading" />
  <div class="dashboard container is-fullhd">
    <DashboardCard :height="1" class="do-not-print">
      <template #title
        >Neighborhoods at risk of overdose in Rhode Island</template
      >
      <template #subtitle
        >This tool shows results from a machine learning model that was updated
        between November 2021 and August 2024. The model used many datasets to
        predict whether an area might be at risk for overdose. Shaded areas show
        us where we might need to focus our overdose prevention efforts. You can
        use this tool to find neighborhoods at risk of overdose across the state
        and learn more about them.
        <br />
        <br />
        <strong>
          To use this tool, select an area on the map below to learn more about
          it.
        </strong>
      </template>
    </DashboardCard>

    <ControlPanel
      v-if="displayControlPanel"
      id="dashboard-control-panel"
      :drop-downs="dropDowns"
      :init-value="controls"
      class="do-not-print"
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
        <h2 v-if="controls.zipcode.zip" class="title only-printed">
          <b>Zip Code:</b> {{ controls.zipcode.zip }}
        </h2>
        <div class="field is-grouped do-not-print">
          <p class="control">
            <button
              v-if="!zoomed"
              :disabled="!activeBG || !activeClickedStatus"
              class="zoom-button button is-family-secondary is-secondary is-light tooltip"
              @click="zoomBg"
            >
              <span class="icon">
                <i class="fas fa-search-plus" />
              </span>
              <span>Zoom to neighborhood</span>
              <!-- Adds tooltip text if the button is disabled -->
              <span v-if="!activeBG || !activeClickedStatus" class="tooltiptext"
                >Select a neighborhood to see more details or zoom in</span
              >
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
        <div v-if="zoomed">
          <p>
            Red circles show where people in this neighborhood gather based on
            anonymous cellular data. Points of interest are used as an
            approximation of where people might be. You can use this information
            to find potential outreach locations.
          </p>
        </div>
        <div v-else>
          <div class="icon-text">
            <div class="is-flex is-flex-direction-row">
              <div class="icon square-red" />
              <p>
                <strong>Persistently high risk for overdose:</strong>
                neighborhoods our model always predicted
              </p>
            </div>
          </div>
          <div class="icon-text">
            <div class="is-flex is-flex-direction-row">
              <div class="icon square-orange" />
              <span
                ><strong>Sporadically high risk for overdose:</strong>
                neighborhoods our model sometimes predicted</span
              >
            </div>
          </div>
          <div class="icon-text">
            <div class="is-flex is-flex-direction-row">
              <div class="icon square" />
              <span
                ><strong>Lower risk for overdose:</strong> neighborhoods our
                model never predicted</span
              >
            </div>
          </div>
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
            Select a <i class="fas fa-circle point-of-interest" /> point of
            interest to copy the address to your clipboard
          </div>
        </div>
      </template>
    </DashboardCard>

    <DashboardCard id="stats" width="one-third" :height="5">
      <template #title><h3>Neighborhood Characteristics</h3></template>
      <template #subtitle
        >When you select a neighborhood, you can use the table below to compare
        its characteristics to town and state values.</template
      >
      <template #content>
        <StatsWidget
          v-if="dataset.cbg.length > 0"
          :dataset="dataset"
          :municipality="computedMuni"
          :geoid="activeBG"
        />
      </template>
    </DashboardCard>

    <DashboardCard :height="1">
      <template #subtitle>Data Notes</template>
      <template #content>
        The PROVIDENT dashboard uses a predictive models to generate
        neighborhood-level (census block group) insights. Predictive analytics
        are forecasting tools that are powered by large datasets. They use
        statistical models to identify patterns in large datasets. With
        predictive analytics, we can use more data than ever before to
        understand the overdose crisis and create a forecast of what to expect.
        The PROVIDENT model consistently identifies the top 20% of neighborhoods
        where more than 40% of overdose deaths subsequently occur. We included
        public health data from state agencies like the Rhode Island Department
        of Health. These data include things like fatal and non-fatal overdose
        events and naloxone availability. We also used neighborhood data on
        underlying overdose risks, such as poverty rates, unemployment trends,
        and resources in each community. These data come from publicly available
        datasets and other sources.

        <ExternalLink href="/resources"
          >Learn more about the PROVIDENT research project</ExternalLink
        >
      </template>
    </DashboardCard>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useProvidentStore } from "../../store";

import geo from "@/assets/geojson/ri.json";
import zipcodes from "@/assets/RI_ZIPS.json";

import { MUNICIPALITIES, sortByProperty } from "../../utils/utils";

import ExternalLink from "../../components/ExternalLink.vue";
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

const locations = computed(() => {
  const ri = { name: "All of Rhode Island", municipalities: [] };
  return [ri, ...towns];
});

const modelDataPeriod = computed(() => store.modelDataPeriod);
const displayControlPanel = computed(
  () => Object.keys(modelDataPeriod).length !== 0,
);

const zipsDropdownOptions = computed(() => {
  let zips = [];

  if (controls.value.geography) {
    const { municipalities } = controls.value.geography;

    if (municipalities.length === 0) {
      // Set the result (for the dropdown) to all of the zip codes in RI
      zips = [...zipcodes];
    } else {
      municipalities.forEach((m) => {
        zips.push(...zipcodes.filter((z) => z.city === m));
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
      values: locations.value,
      title: "Where do you want to look?",
    },
    zipcode: {
      icon: "fas fa-map",
      values: zipsDropdownOptions.value,
      title: "Which zip code do you want to focus on?",
    },
  };
});

const controls = ref({
  geography: locations.value[0], // All Towns
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
    param: "muni",
    ref: controls,
    refField: "geography",
    valid: (v) => locations.value.find((l) => l.name === v) !== undefined,
    push: true,
    getInitParam: () => controls.value.geography.name,
    valToParam: (v) => v.name,
    paramToVal: (v) => locations.value.find((l) => l.name === v),
  },
  {
    param: "zip",
    ref: controls,
    refField: "zipcode",
    valid: (v) =>
      zipsDropdownOptions.value.find((z) => z.name === v) !== undefined,
    push: true,
    getInitParam: () => controls.value.zipcode.name,
    valToParam: (v) => v.name,
    paramToVal: (v) => zipsDropdownOptions.value.find((z) => z.name === v),
  },
  {
    param: "bg",
    ref: activeBG,
    refField: undefined,
    valid: (v) =>
      BLOCK_GROUPS.find(({ blockGroup }) => blockGroup === v) !== undefined,
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
};

const zoomBg = () => {
  zoomed.value = true;
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
  opacity: 0.5;
}

.square-red {
  @extend .square;
  background-color: $trajectory-red;
}

.square-orange {
  @extend .square;
  background-color: $trajectory-orange;
}

.square-grey {
  @extend .square;
  background-color: $trajectory-grey;
}

@media print {
  // Add print styles for legend colors
  .square,
  .square-red,
  .square-orange,
  .square-grey {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .square-red {
    background-color: $trajectory-red !important;
    border-color: $trajectory-red !important;
  }

  .square-orange {
    background-color: $trajectory-orange !important;
    border-color: $trajectory-orange !important;
  }

  .square-grey {
    background-color: $trajectory-grey !important;
    border-color: $trajectory-grey !important;
  }

  // Dashboard
  // Force dashboard to single column layout
  .dashboard {
    display: block !important; // Change from grid to block
    padding: 0.5rem !important;
    column-gap: 0 !important;
    row-gap: 0.5rem !important;
  }

  // Make all dashboard cards full width and stack vertically
  .dashboard > * {
    width: 100% !important;
    max-width: 100% !important;
    grid-column: unset !important;
    grid-row: unset !important;
    margin-bottom: 1rem !important;
    page-break-inside: avoid !important;
  }
}

.point-of-interest {
  color: $pori-red;
}

.zoom-button {
  min-width: 220px;
}

// Hack: Sorry! Very quick fix so that the tooltip's opacity inherits an opacity of 1.
.zoom-button:disabled {
  opacity: 1 !important;
  color: rgba(0, 0, 0, 0.5) !important;
}

// Tooltip for the Zoom button
.tooltip {
  position: relative;
  display: inline-block;
  border-bottom: 1px dotted black;
}

.tooltip .tooltiptext {
  visibility: hidden;
  min-width: 200px;
  max-width: 100%;
  background-color: #000;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 8px 12px;
  position: absolute;
  z-index: 10;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.3s;
  overflow-wrap: normal;
  white-space: normal; /* Allow multiple lines for wrapping */
}

.tooltip .tooltiptext::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #555 transparent transparent transparent;
}

.tooltip:hover .tooltiptext {
  visibility: visible;
  opacity: 1;
}
</style>
