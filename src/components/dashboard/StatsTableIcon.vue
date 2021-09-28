<template>
  <span class="has-text-grey-dark is-family-monospace">
    <span v-if="!iconOnly">{{
      stats[metric] !== undefined ? formatFn(stats[metric]) : "-"
    }}</span
    ><span class="has-text-weight-bold" :class="['has-text-' + color]">⬥</span>
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
    iconOnly: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const { stats, metric, location } = toRefs(props);

    const color = computed(() => {
      let color = "light";
      if (location.value) {
        switch (stats.value[metric.value + "_tertile"]) {
          case 1:
            color = "success";
            break;
          case 2:
            color = "warning";
            break;
          case 3:
            color = "danger";
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

// between size 6 and 7
.stat-icon {
  font-size: 0.825rem;
}
</style>
