<template>
  <div>
    <h6 class="is-size-6-7 has-text-weight-bold">Resources Available:</h6>
    <p class="is-size-6-7">
      A neighborhood’s resilience to overdose depends on its resources. We
      compared each neighborhood to the median, or middle, amount of resources
      available to Rhode Islanders.
    </p>
    <div
      class="legend-item is-size-6-7 is-flex is-flex-wrap-wrap is-justify-content-space-between"
    >
      <div
        v-for="item in items"
        :key="item.text"
        class="is-flex is-align-items-center"
      >
        <span
          class="has-text-weight-bold is-size-5"
          :style="{ color: item.color }"
          >{{ item.symbol }}</span
        >
        <span class="optical-centering">{{ item.text }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { tertileColorMap } from "@/utils/utils.js";

const items = [
  {
    symbol: "⬥",
    color: tertileColorMap.get(1),
    text: "More",
  },
  {
    symbol: "⬥",
    color: tertileColorMap.get(2),
    text: "Similar",
  },
  {
    symbol: "⬥",
    color: tertileColorMap.get(3),
    text: "Less",
  },
  {
    symbol: "⬦",
    color: "hsl(0deg 0% 70%)",
    text: "No data",
  },
];
</script>

<style lang="scss" scoped>
.legend-item {
  line-height: 1;
}
.optical-centering {
  padding-bottom: 0.12rem;
}
</style>
