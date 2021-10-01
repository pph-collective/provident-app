<template>
  <span class="has-text-grey-dark is-family-monospace">
    <span v-if="!iconOnly">{{
      stats[metric] !== undefined ? formatFn(stats[metric]) : "-"
    }}</span>
  </span>
</template>

<script>
import { computed, toRefs } from "vue";
import { scaleLinear } from "d3-scale";
import { interpolateLab } from "d3-interpolate";

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
    iconOnly: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const { stats, metric, location } = toRefs(props);

    const scale = scaleLinear()
      .domain([-1, 0, 1.0])
      .range(["#2A3465", "#dbdbdb", "orange"])
      .interpolate(interpolateLab);

    const color = computed(() => {
      let color = "#dbdbdb";
      if (location.value) {
        color = scale(stats.value[metric.value + "_normalized"]);
        console.log(stats.value[metric.value + "_normalized"], color);
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
.rotate-up {
  transform: rotate(-45deg);
}

.rotate-down {
  transform: rotate(45deg);
}

// between size 6 and 7
.stat-icon {
  font-size: 0.825rem;
}
</style>
