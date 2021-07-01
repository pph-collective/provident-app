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
    previousStats: {
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
    const { stats, metric, location, previousStats } = toRefs(props);

    const getTertile = (s, m) => {
      if (s[m] <= s[m + "_lower"]) {
        return 1;
      } else if (s[m] <= s[m + "_upper"]) {
        return 2;
      } else {
        return 3;
      }
    };

    const icon = computed(() => {
      let color = "light";
      let type = [];
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

        if (previousStats.value[metric.value]) {
          type.push("fas", "fa-arrow-alt-circle-right");
          const previousTertile = getTertile(previousStats.value, metric.value);
          if (currentTertile < previousTertile) {
            type.push("rotate-down");
          } else if (currentTertile > previousTertile) {
            type.push("rotate-up");
          }
        } else {
          type.push("fas", "fa-circle");
        }
      } else {
        type.push("far", "fa-circle");
      }

      return { color, type };
    });

    return {
      icon
    };
  }
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
