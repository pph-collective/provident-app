<template>
  <DashboardCard :no-header="true" width="two-thirds" :height="1">
    <template #content>
      <div class="control-panel is-family-secondary">
        <div
          v-for="(options, type) in dropDowns"
          :key="'control-panel-dropdown-' + type"
          class="control-panel-dropdown control has-icons-left"
        >
          <span class="select">
            <select :id="type" v-model="selected[type]">
              <option
                v-for="(option, index) in options.values"
                :key="'option-' + index"
                :value="option"
              >
                {{ option.name || option }}
              </option>
            </select>
          </span>
          <span class="icon is-small is-left pl-1">
            <i :class="options.icon" />
          </span>
        </div>
      </div>
    </template>
  </DashboardCard>
</template>

<script>
import { reactive, toRefs, watch } from "vue";

import DashboardCard from "@/components/dashboard/DashboardCard.vue";

export default {
  components: {
    DashboardCard,
  },
  props: {
    dropDowns: {
      type: Object,
      required: true,
    },
  },
  emits: ["selected"],
  setup(props, { emit }) {
    const { dropDowns } = toRefs(props);

    const res = {};
    Object.keys(dropDowns.value).forEach((k) => {
      res[k] = dropDowns.value[k].values[0];
    });

    const selected = reactive(res);
    emit("selected", selected);

    watch(
      () => selected,
      () => {
        emit("selected", selected);
      },
      { deep: true },
    );

    return {
      selected,
    };
  },
};
</script>

<style lang="scss" scoped>
.control-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  grid-gap: 1rem;
  justify-items: center;
}
.control-panel-dropdown {
  width: 100%;
  max-width: 400px;
  .select,
  select {
    width: 100%;
  }
}
</style>
