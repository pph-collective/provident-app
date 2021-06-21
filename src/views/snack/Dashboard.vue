<template>
  <div class="dashboard p-4">
    <ControlPanel
      data-cy="control-panel"
      :drop-downs="dropDowns"
      @selected="controls = $event"
    />
    <Card v-if="controls.geography">
      <template #title>Map: {{ controls.geography.name }}</template>
      <template #subtitle>Some really great insights</template>
      <template #content>
        <div class="map-container">
          <Map
            :dataset="[]"
            :filter-municipalities="controls.geography.municipalities"
            :data-cy="controls.geography.name"
          />
        </div>
      </template>
    </Card>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { useStore } from "vuex";

import Card from "@/components/dashboard/Card.vue";
import ControlPanel from "@/components/dashboard/ControlPanel.vue";
import Map from "@/components/Map.vue";

export default {
  components: {
    ControlPanel,
    Map,
    Card
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

    return {
      dropDowns,
      controls
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
