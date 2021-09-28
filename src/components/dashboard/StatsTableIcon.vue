<template>
  <span class="stat-icon has-text-grey-dark is-family-monospace">
    {{ stats[metric] !== undefined ? formatFn(stats[metric]) : "-"
    }}<span class="has-text-weight-bold" :class="['has-text-' + color]">⬥</span>
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
    tertileDirection: {
      type: String,
      required: true,
    },
    formatFn: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const { stats, metric, location, tertileDirection } = toRefs(props);

    const tertile = computed(() => {
      const val = stats.value[metric.value];
      if (val === undefined) {
        return 0;
      }

      let res;
      if (val <= stats.value[metric.value + "_lower"]) {
        res = 1;
      } else if (val <= stats.value[metric.value + "_upper"]) {
        res = 2;
      } else {
        res = 3;
      }

      if (tertileDirection.value === "descending") {
        res = Math.abs(res - 4);
      }

      return res;
    });

    const color = computed(() => {
      let color = "light";
      if (location.value) {
        switch (tertile.value) {
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
