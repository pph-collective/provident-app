<template>
  <Multiselect
    :id="column.columnDef.header?.toString()"
    v-model="selected"
    class="input is-small"
    mode="tags"
    :options="options"
    :searchable="true"
  />
</template>

<script setup lang="ts">
import { ref, toRefs, watch } from "vue";
import { Column, Table } from "@tanstack/vue-table";
import Multiselect from "@vueform/multiselect";

const props = defineProps<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  column: Column<any, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: Table<any>;
  options: string[];
}>();
const { column, options } = toRefs(props);

const selected = ref([]);

watch(
  () => selected.value,
  () => column.value.setFilterValue(selected.value.toString()),
);
</script>
