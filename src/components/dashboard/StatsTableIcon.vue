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

<script>
import { computed, toRefs } from "vue";

import { tertileColorMap } from "@/utils/utils.js";

export default {
  props: {
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
      default() {},
    },
    icon: {
      type: Boolean,
      default: true,
    },
    number: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const { stats, metric, location } = toRefs(props);

    const color = computed(() => {
      let color = "hsl(0deg 0% 70%)";
      if (location.value) {
        color =
          tertileColorMap.get(stats.value[metric.value + "_tertile"]) ?? color;
      }

      return color;
    });

    return {
      color,
    };
  },
};
</script>

<style lang="scss" scoped>
.stat-table-icon {
  line-height: 1;
}
</style>
