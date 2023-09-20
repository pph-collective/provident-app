<template>
  <div class="stat-table-icon has-text-grey-dark is-family-monospace">
    <span v-if="number">{{
      stats[metric] !== undefined ? formatFn(stats[metric]) : "-"
    }}</span
    ><span
      v-if="icon"
      class="has-text-weight-bold is-size-5"
      :style="{ color }"
      >{{ location ? "⬥" : "⬦" }}</span
    >
  </div>
</template>

<script setup>
import { computed } from "vue";
import { tertileColorMap } from "@/utils/utils.js";

const props = defineProps({
  stats: {
    type: Object,
    required: true,
  },
  metric: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  formatFn: {
    type: Function,
    required: false,
    default: () => ({}),
  },
  icon: {
    type: Boolean,
    default: true,
  },
  number: {
    type: Boolean,
    default: true,
  },
});

const color = computed(() => {
  let color = "hsl(0deg 0% 70%)";
  if (props.location) {
    color =
      tertileColorMap.get(props.stats[props.metric + "_tertile"]) ?? color;
  }

  return color;
});
</script>

<style lang="scss" scoped>
.stat-table-icon {
  line-height: 1;
}
</style>
