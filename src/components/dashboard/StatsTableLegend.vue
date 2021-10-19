<template>
  <div>
    <h6 class="is-size-6-7 has-text-weight-bold">Legend:</h6>
    <div
      class="
        is-size-6-7 is-flex is-flex-wrap-wrap is-justify-content-space-between
      "
    >
      <div v-for="item in items" :key="item.text">
        <span class="has-text-weight-bold" :style="{ color: item.color }">{{
          item.symbol
        }}</span>
        {{ item.text }}
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
        text: "Lower third",
      },
      {
        symbol: "⬥",
        color: tertileColorMap.get(2),
        text: "Middle third",
      },
      {
        symbol: "⬥",
        color: tertileColorMap.get(3),
        text: "Upper third",
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
