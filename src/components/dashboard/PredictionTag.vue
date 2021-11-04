<template>
  <div
    class="prediction-tag notification is-size-6-7 p-1 has-text-centered mb-0"
  >
    <p v-if="prediction === '1'">
      Identified by PROVIDENT as
      <span class="has-text-weight-bold">Higher Risk</span>
    </p>
    <p v-else-if="prediction === '0'">
      Not Identified by PROVIDENT as Higher Risk
    </p>
    <p v-else>No PROVIDENT Prediction Available</p>
  </div>
</template>

<script>
export default {
  props: {
    prediction: {
      type: String,
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped>
.prediction-tag {
  color: red;
}
</style>
