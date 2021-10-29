<template>
  <div>
    <h6 class="is-size-6-7 has-text-weight-bold">Legend:</h6>
    <div
      class="
        legend-item
        is-size-6-7 is-flex is-flex-wrap-wrap is-justify-content-space-between
      "
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

<script>
import { tertileColorMap } from "@/utils/utils.js";

export default {
  setup() {
    const items = [
      {
        symbol: "⬥",
        color: tertileColorMap.get(1),
        text: "More Protective",
      },
      {
        symbol: "⬥",
        color: tertileColorMap.get(2),
        text: "Middle third",
      },
      {
        symbol: "⬥",
        color: tertileColorMap.get(3),
        text: "More Risk",
      },
      {
        symbol: "⬦",
        color: "hsl(0deg 0% 70%)",
        text: "No data",
      },
    ];

    return { items };
  },
};
</script>

<style lang="scss" scoped>
.legend-item {
  line-height: 1;
}
.optical-centering {
  padding-bottom: 0.12rem;
}
</style>
