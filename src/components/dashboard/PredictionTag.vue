<template>
  <div
    class="prediction-tag notification is-size-6-7 p-1 has-text-centered my-1"
    :style="{ '--color': getColor(prediction) }"
  >
    <p v-if="prediction === '1'">
      <span class="has-text-weight-bold">Prioritized</span>
      by PROVIDENT model
    </p>
    <p v-else-if="prediction === '0'">Not prioritized by PROVIDENT model</p>
    <p v-else-if="prediction === '-'">Not elibgible for PROVIDENT prediction</p>
    <p v-else>No block group selected</p>
  </div>
</template>

<script>
import { tertileColorMap } from "@/utils/utils.js";

export default {
  props: {
    prediction: {
      type: String,
      required: true,
    },
  },
  setup() {
    const getColor = (prediction) => {
      if (prediction === "1") {
        return tertileColorMap.get(3);
      } else if (prediction === "0") {
        return tertileColorMap.get(1);
      } else {
        return tertileColorMap.get(2);
      }
    };
    return {
      getColor,
    };
  },
};
</script>

<style lang="scss" scoped>
.prediction-tag {
  --color: lightgrey;
  border: solid 1px var(--color);
  background-color: var(--color);
  background-image: linear-gradient(
    hsla(255, 100%, 100%, 0.8) 100%,
    transparent 100%
  );
}
</style>
