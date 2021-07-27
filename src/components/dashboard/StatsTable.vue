<template>
  <div>
    <p>
      <span class="is-size-5 has-text-weight-semibold">Municipality: </span
      >{{ municipality }}
    </p>
    <p>
      <span class="is-size-5 has-text-weight-semibold">Block Group: </span
      >{{ geoid }}
    </p>
  </div>

  <!-- fix table column widths so it doesn't change with the data -->
  <table class="table is-striped is-fullwidth">
    <thead>
      <tr>
        <th class="has-text-right">Metric</th>
        <th class="data-column"><abbr title="Rhode Island">RI</abbr></th>
        <th class="data-column"><abbr :title="municipality">Town</abbr></th>
        <th class="data-column"><abbr :title="geoid">BG</abbr></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="metric in metricsList" :key="metric">
        <th class="has-text-right">{{ metric }}</th>
        <td class="data-column">
          <StatsTableIcon
            :metric="metric"
            :stats="current.ri"
            :previous-stats="previous.ri"
            location="RI"
          />
        </td>
        <td class="data-column">
          <StatsTableIcon
            :metric="metric"
            :stats="current.municipality"
            :previous-stats="previous.municipality"
            :location="municipality"
          />
        </td>
        <td class="data-column">
          <StatsTableIcon
            :metric="metric"
            :stats="current.geoid"
            :previous-stats="previous.geoid"
            :location="geoid"
          />
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { toRefs } from "vue";
import * as aq from "arquero";

import { useStats } from "@/composables/useStats.js";
import StatsTableIcon from "@/components/dashboard/StatsTableIcon.vue";

export default {
  components: {
    StatsTableIcon,
  },
  props: {
    dataset: {
      type: Array,
      required: true,
    },
    previousDataset: {
      type: Array,
      required: true,
    },
    municipality: {
      type: String,
      required: false,
      default: "",
    },
    geoid: {
      type: String,
      required: false,
      default: "",
    },
    withPredictions: {
      type: Boolean,
      required: true,
    },
  },

  setup(props) {
    const { dataset, geoid, municipality, previousDataset, withPredictions } =
      toRefs(props);

    const metrics = {
      mean: ["pct_demographic_1", "pct_demographic_2"],
      sum: [],
    };

    if (withPredictions.value) metrics.sum.push("flag_1");

    const metricsList = Object.values(metrics).flat();

    const statFns = {};
    for (const [agg, aggMetrics] of Object.entries(metrics)) {
      for (const metric of aggMetrics) {
        statFns[metric] = aq.op[agg](metric);
      }
    }

    const tertileFns = {};
    for (const metric of metricsList) {
      tertileFns[metric + "_lower"] = aq.op.quantile(metric, 0.33);
      tertileFns[metric + "_upper"] = aq.op.quantile(metric, 0.67);
    }

    const { stats: current } = useStats({
      statFns,
      tertileFns,
      dataset,
      municipality,
      geoid,
    });

    const { stats: previous } = useStats({
      statFns,
      tertileFns,
      dataset: previousDataset,
      municipality,
      geoid,
    });

    return {
      current,
      previous,
      metricsList,
    };
  },
};
</script>

<style lang="scss" scoped>
.data-column {
  width: 45px;
  padding-left: 5px;
  padding-right: 5px;
  text-align: center !important;
}
</style>
