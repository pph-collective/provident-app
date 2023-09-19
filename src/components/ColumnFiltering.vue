<template>
  <input
    class="input is-small"
    type="text"
    :value="columnFilterValue ?? ''"
    placeholder="Search..."
    @input="(e) => column.setFilterValue(e.target.value)"
  />
</template>

<script setup lang="ts">
import { Column, Table } from "@tanstack/vue-table";

const props = defineProps<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  column: Column<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: Table<any>;
}>();

const columnFilterValue = props.column.getFilterValue();
</script>

<style lang="scss" scoped>
@import "../assets/styles/main.scss";
</style>
