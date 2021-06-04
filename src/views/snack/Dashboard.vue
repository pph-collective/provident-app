<template>
  <div class="dashboard p-4">
    <ControlPanel :drop-downs="dropDowns" @selected="updateControl($event)" />
    <p>{{ controls }}</p>
    <div class="map-container box">
      <Map :dataset="[]" />
    </div>
  </div>
</template>

<script>
import { ref } from "vue";

import ControlPanel from "@/components/dashboard/ControlPanel.vue";
import Map from "@/components/Map.vue";

export default {
  components: {
    ControlPanel,
    Map
  },
  setup() {
    const dropDowns = {
      geography: {
        icon: "fas fa-globe",
        values: ["All of Rhode Island", "RI 4 Good"]
      },
      model_version: {
        icon: "fas fa-calendar-alt",
        values: ["Current", "2020 Q1"]
      }
    };

    const controls = ref({
      geography: dropDowns.geography.values[0],
      model_version: dropDowns.model_version.values[0]
    });

    const updateControl = e => {
      controls.value[e.type] = e.value;
    };

    return {
      dropDowns,
      controls,
      updateControl
    };
  }
};
</script>

<style lang="scss" scoped>
.map-container {
  max-width: 90vw;
}
</style>
