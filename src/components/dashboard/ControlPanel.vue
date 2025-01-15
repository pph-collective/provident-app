<template>
  <DashboardCard :no-header="true" :height="1">
    <template #content>
      <div class="control-panel is-family-secondary">
        <div
          v-for="(options, type) in dropDowns"
          :key="'control-panel-dropdown-' + type"
          class="control-panel-dropdown control has-icons-left"
        >
          <span
            ><b>{{ options.title }}</b></span
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
            <span class="icon is-small is-left pl-1">
              <i :class="options.icon" />
            </span>
          </span>
        </div>
      </div>
    </template>
  </DashboardCard>
</template>

<script setup>
import { reactive, watch } from "vue";

import DashboardCard from "@/components/dashboard/DashboardCard.vue";

const props = defineProps({
  dropDowns: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["selected"]);

const res = {};
Object.keys(props.dropDowns).forEach((k) => {
  res[k] = props.dropDowns[k].values[0];
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
