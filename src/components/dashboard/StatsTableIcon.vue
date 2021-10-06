<template>
  <span class="has-text-grey-dark is-family-monospace">
    <span v-if="number">{{
      stats[metric] !== undefined ? formatFn(stats[metric]) : "-"
    }}</span
    ><span
      v-if="icon"
      class="has-text-weight-bold is-size-5"
      :style="{ color }"
      >{{ location ? "⬥" : "⬦" }}</span
    >
  </span>
</template>

<script>
import { computed, toRefs } from "vue";

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
        switch (stats.value[metric.value + "_tertile"]) {
          case 1:
            color = "hsl(230deg 41% 28%)";
            break;
          case 2:
            color = "hsl(0deg 0% 70%)";
            break;
          case 3:
            color = "orange";
            break;
        }
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
</style>
