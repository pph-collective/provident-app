<template>
  {{ stats }}
</template>

<script>
import { toRefs, computed } from "vue";
import * as aq from "arquero";

export default {
  props: {
    dataset: {
      type: Array,
      required: true
    },
    geoid: {
      type: String,
      required: false,
      default: ""
    }
  },

  setup(props) {
    const { dataset, geoid } = toRefs(props);

    const statFns = {
      mean_1: aq.op.mean("pct_demographic_1"),
      mean_2: aq.op.mean("pct_demographic_2")
    };

    const dt = computed(() => {
      return aq.from(dataset.value);
    });

    const ri = computed(() => {
      return dt.value
        .rollup(statFns)
        .derive({ area: () => "RI" })
        .objects()[0];
    });

    const bg = computed(() => {
      return dt.value
        .filter(`d => d.geoid === '${geoid.value}'`)
        .rollup(statFns)
        .derive({ area: `'${geoid.value}'` })
        .objects()[0];
    });

    const stats = computed(() => {
      return {
        ri: ri.value,
        geoid: bg.value
      };
    });

    return {
      stats
    };
  }
};
</script>
