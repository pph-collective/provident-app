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
        <th class="has-text-right is-size-7">{{ metric }}</th>
        <td class="data-column has-text-center">
          <StatsTableIcon
            :metric="metric"
            :format-fn="formatFns[metric]"
            :stats="current.ri"
            :previous-stats="previous.ri"
            location="RI"
          />
        </td>
        <td class="data-column has-text-center">
          <StatsTableIcon
            :metric="metric"
            :format-fn="formatFns[metric]"
            :stats="current.municipality"
            :previous-stats="previous.municipality"
            :location="municipality"
          />
        </td>
        <td class="data-column has-text-center">
          <StatsTableIcon
            :metric="metric"
            :format-fn="formatFns[metric]"
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
import { format } from "d3-format";

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

    const formatters = {
      pct: format(".1%"),
      dollar: format("$,.0f"),
    };

    const metrics = {
      median: [
        "below_poverty",
        "unemployed",
        "income",
        "no_high_school_diploma",
        "age_65_older",
        "age_17_younger",
        "household_with_disability",
        "single_parent_households",
        "minority",
        "no_english",
        "multi_unit_structures",
        "mobile_homes",
        "crowded_housing",
        "no_vehicle",
      ],
      sum: [],
    };

    const formats = {
      pct: [
        "below_poverty",
        "unemployed",
        "no_high_school_diploma",
        "age_65_older",
        "age_17_younger",
        "household_with_disability",
        "single_parent_households",
        "minority",
        "no_english",
        "multi_unit_structures",
        "mobile_homes",
        "crowded_housing",
        "no_vehicle",
      ],
      dollar: ["income"],
    };

    if (withPredictions.value) metrics.sum.push("flag_1");

    const metricsList = Object.values(metrics).flat();

    const statFns = {};
    for (const [agg, aggMetrics] of Object.entries(metrics)) {
      for (const metric of aggMetrics) {
        statFns[metric] = aq.op[agg](metric);
      }
    }

    const formatFns = {};
    for (const [format, formatMetrics] of Object.entries(formats)) {
      for (const metric of formatMetrics) {
        formatFns[metric] = formatters[format];
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
      formatFns,
    };
  },
};
</script>

<style lang="scss" scoped>
.table {
  line-height: 1;

  th,
  td {
    vertical-align: middle;
    padding-top: 0.2em;
    padding-bottom: 0.2em;
  }
}

.data-column {
  min-width: 60px;
  padding-left: 3px;
  padding-right: 3px;
  text-align: center !important;
}
</style>
