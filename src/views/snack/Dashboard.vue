<template>
  <Loading :loading="loading" />
  <div class="dashboard container is-fullhd">
    <ControlPanel
      v-if="resultPeriods.length > 0"
      id="dashboard-control-panel"
      :drop-downs="dropDowns"
      @selected="updateControls"
    />

    <Card style="align-self: start" width="two-thirds" :height="5" id="map">
      <template #title
        >Map:
        {{
          zoomed
            ? `${activeMuni} - ${activeGeoid}`
            : controls?.geography?.name ?? ""
        }}</template
      >
      <template #top-right>
        <button
          v-if="!zoomed"
          :disabled="!activeGeoid || !activeClickedStatus"
          class="zoom-button button is-family-secondary is-secondary is-light"
          @click="zoomBg"
        >
          <span class="icon">
            <i class="fas fa-search-plus"></i>
          </span>
          <span>Zoom to Block Group</span>
        </button>
        <button
          v-else
          class="zoom-button button is-family-secondary is-secondary is-light"
          @click="zoomed = false"
        >
          <span class="icon">
            <i class="fas fa-search-minus"></i>
          </span>
          <span>Zoom Back Out</span>
        </button>
      </template>
      <template #subtitle
        >Click on a block group to see more details or zoom in</template
      >
      <template #content>
        <div v-if="controls.geography" class="map-container">
          <Map
            id="main-map"
            v-if="dataset.length > 0"
            class="is-absolute"
            :dataset="dataset"
            :filter-municipalities="controls.geography.municipalities"
            flag-property="prediction"
            :with-predictions="interventionArmUser"
            :zipcode="controls.zipcode"
            @new-active-municipality="activeMuni = $event"
            @new-active-bg="activeGeoid = $event"
            @active-clicked-status="clickMap"
            :data-cy="controls.geography.name"
          />
          <BGMap
            id="bg-zoom-map"
            v-if="activeGeoid && zoomed"
            :block-group="activeGeoid"
            :dataset="dataset"
            class="is-absolute"
          />
          <div v-if="activeGeoid && zoomed" class="instructions is-size-6-7">
            Click on a point of interest to copy the address to your clipboard
          </div>
        </div>
      </template>
    </Card>

    <Card width="one-third" :height="5" id="stats">
      <template #title>Stats: {{ controls.model_version }}</template>
      <template #content>
        <StatsWidget
          v-if="dataset.length > 0"
          :dataset="dataset"
          :municipality="activeMuni"
          :geoid="activeGeoid"
          :with-predictions="interventionArmUser"
        />
      </template>
    </Card>

    <Card width="one-third" :height="2" id="nra-widget" :no-header="true">
      <template #content>
        <AssessmentWidget
          :active-geoid="activeGeoid"
          :active-muni="activeMuni"
        />
      </template>
    </Card>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick } from "vue";
import { useStore } from "vuex";
import * as aq from "arquero";

import fb from "@/firebase.js";
import { MUNICIPALITIES, sortByProperty } from "@/utils/utils";

import Card from "@/components/dashboard/Card.vue";
import ControlPanel from "@/components/dashboard/ControlPanel.vue";
import Map from "@/components/dashboard/Map.vue";
import BGMap from "@/components/dashboard/BGMap.vue";
import StatsWidget from "@/components/dashboard/StatsWidget.vue";
import AssessmentWidget from "@/components/dashboard/AssessmentWidget.vue";
import Loading from "@/components/Loading.vue";

export default {
  components: {
    ControlPanel,
    Map,
    BGMap,
    Card,
    StatsWidget,
    AssessmentWidget,
    Loading,
  },
  setup() {
    const towns = MUNICIPALITIES.map((m) => ({
      name: m,
      municipalities: [m],
    }));

    const store = useStore();
    const interventionArmUser = computed(
      () => store.getters.interventionArmUser
    );
    const dataset = ref([]);
    const activeGeoid = ref("");
    const activeMuni = ref("");
    const activeClickedStatus = ref(false);
    const zoomed = ref(false);

    const filteredOrgs = computed(() => {
      const ri = { name: "All of Rhode Island", municipalities: [] };
      const orgs = store.state.organizations;
      if (store.state.user.admin) {
        return [ri, ...orgs, ...towns];
      } else if (store.state.user.data) {
        return [
          orgs.find((o) => o.name === store.state.user.data.organization),
          ri,
          ...towns,
        ];
      } else {
        // shouldn't hit here in reality
        return [ri, ...towns];
      }
    });

    const resultPeriods = ref([]);
    const zipcodes = ref([]);
    onMounted(async () => {
      resultPeriods.value = await fb.getModelDataPeriods();
    });
    onMounted(async () => {
      zipcodes.value = await fb.getZipcodes();
    });

    const zipsDropdownOptions = computed(() => {
      let zips = [];

      if (controls.value.geography) {
        const { name, municipalities } = controls.value.geography;

        if (name === "All of Rhode Island") {
          // Set the result (for the dropdown) to all of the zip codes in RI
          zips = zipcodes.value;
        } else {
          municipalities.forEach((m) => {
            zips.push(...zipcodes.value.filter((z) => z.town === m));
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
        updateDataset(newControls.model_version).then((res) => {
          dataset.value = res;
        });
      }

      if (newControls.geography !== controls.value.geography) {
        newControls.zipcode = zipsDropdownOptions.value[0];
      }

      // update the control selections
      for (const [k, v] of Object.entries(newControls)) {
        controls.value[k] = v;
      }
    };

    const loading = computed(() => {
      return dataset.value.length === 0 || resultPeriods.value.length === 0;
    });

    // TODO: the timing of the click signal listener and the active Geography signal listener make this not always right
    const clickMap = (clickedStatus) => {
      activeClickedStatus.value = clickedStatus;
      if (clickedStatus) {
        // wait for the next render cycle as the activeGeoid gets updated at about the
        // same time and otherwise could be stale
        nextTick(() =>
          fb.logActivity(
            store.state.user.data.email,
            "click map",
            activeGeoid.value
          )
        );
      }
    };

    const zoomBg = () => {
      zoomed.value = true;
      fb.logActivity(
        store.state.user.data.email,
        "zoom map",
        activeGeoid.value
      );
    };

    return {
      activeClickedStatus,
      activeGeoid,
      activeMuni,
      clickMap,
      controls,
      dataset,
      dropDowns,
      interventionArmUser,
      loading,
      resultPeriods,
      updateControls,
      zipcodes,
      zoomBg,
      zoomed,
    };
  },
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
</style>
