<template>
  <span class="has-text-grey-dark is-family-monospace" v-if="!iconOnly">{{
    stats[metric] !== undefined ? formatFn(stats[metric]) : "-"
  }}</span
  ><span
    class="has-text-weight-bold"
    :class="['is-size-' + size]"
    :style="{ color }"
    >{{ shape }}</span
  >
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
      }

      return color;
    });

    const shape = computed(() => {
      let shape = "◦";
      if (location.value) {
        const value = stats.value[metric.value + "_normalized"];
        if (Math.abs(value) < 0.1) {
          shape = "●";
        } else if (value >= 0.1) {
          shape = "◼︎";
        } else {
          shape = "◆";
        }
      }

      return shape;
    });

    const size = computed(() => {
      let size = "6";
      if (location.value) {
        const value = stats.value[metric.value + "_normalized"];
        if (value >= 0.1) {
          size = "6-7";
        }
      }

      return size;
    });

    return {
      color,
      shape,
      size,
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
