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
    previousStats: {
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
      required: true,
    },
  },
  setup(props) {
    const { stats, metric, location } = toRefs(props);

    const getTertile = (s, m) => {
      if (s[m] === undefined) {
        return 0;
      } else if (s[m] <= s[m + "_lower"]) {
        return 1;
      } else if (s[m] <= s[m + "_upper"]) {
        return 2;
      } else {
        return 3;
      }
    };

    const color = computed(() => {
      let color = "light";
      if (location.value) {
        const currentTertile = getTertile(stats.value, metric.value);
        switch (currentTertile) {
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
