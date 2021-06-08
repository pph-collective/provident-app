<template>
  <div class="dashboard p-4">
    <ControlPanel :drop-downs="dropDowns" @selected="controls = $event" />
    <p>{{ controls }}</p>
    <div class="map-container box">
      <Map
        :dataset="[]"
        :filter-municipalities="
          controls.geography ? controls.geography.municipalities : []
        "
      />
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { useStore } from "vuex";

import ControlPanel from "@/components/dashboard/ControlPanel.vue";
import Map from "@/components/Map.vue";

export default {
  components: {
    ControlPanel,
    Map
  },
  setup() {
    const store = useStore();
    const user = computed(() => store.state.user);

    const filteredOrgs = computed(() => {
      const ri = { name: "All of Rhode Island", municipalities: [] };
      const orgs = store.state.organizations;
      if (user.value.admin) {
        return [ri, ...orgs];
      } else {
        return [orgs.find(o => o.name === user.value.data.organization), ri];
      }
    });

    const dropDowns = computed(() => {
      return {
        geography: {
          icon: "fas fa-globe",
          values: filteredOrgs.value
        },
        model_version: {
          icon: "fas fa-calendar-alt",
          values: ["Current", "2020 Q1"]
        }
      };
    });

    const controls = ref({});

    // const updateControl = e => {
    //   console.log(e.value.name);
    //   controls.value[e.type] = e.value;
    // };

    return {
      dropDowns,
      controls
      // updateControl
    };
  }
};
</script>

<style lang="scss" scoped>
.map-container {
  max-width: 90vw;
}
</style>
