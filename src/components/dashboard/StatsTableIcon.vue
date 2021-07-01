<template>
  <span :class="['icon', 'has-text-' + icon.color]">
    <i :class="icon.type"></i>
  </span>
</template>

<script>
import { computed, toRefs } from "vue";

export default {
  props: {
    stats: {
      type: Object,
      required: true
    },
    metric: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const { stats, metric, location } = toRefs(props);

    const icon = computed(() => {
      if (location.value) {
        if (stats.value[metric.value] <= stats.value[metric.value + "_lower"]) {
          return { type: "fas fa-chevron-circle-down", color: "success" };
        } else if (
          stats.value[metric.value] <= stats.value[metric.value + "_upper"]
        ) {
          return { type: "fas fa-minus-circle", color: "warning" };
        } else {
          return { type: "fas fa-chevron-circle-up", color: "danger" };
        }
      } else {
        return { type: "far fa-circle", color: "light" };
      }
    });

    return {
      icon
    };
  }
};
</script>
