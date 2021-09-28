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
      <tr v-for="metric in metrics" :key="metric">
        <th class="has-text-right is-size-7">{{ metric.title }}</th>
        <td class="data-column has-text-center">
          <StatsTableIcon
            :metric="metric.field"
            :format-fn="metric.formatter"
            :stats="current.ri"
            :tertile-direction="metric.tertile_direction"
            location="RI"
          />
        </td>
        <td class="data-column has-text-center">
          <StatsTableIcon
            :metric="metric.field"
            :format-fn="metric.formatter"
            :stats="current.municipality"
            :tertile-direction="metric.tertile_direction"
            :location="municipality"
          />
        </td>
        <td class="data-column has-text-center">
          <StatsTableIcon
            :metric="metric.field"
            :format-fn="metric.formatter"
            :stats="current.geoid"
            :tertile-direction="metric.tertile_direction"
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
    const { dataset, geoid, municipality, withPredictions } = toRefs(props);

    // number formatters
    const pct = format(".1%");
    const dollar = format("$,.0f");

    const metrics = [
      {
        field: "below_poverty",
        title: "Below FPL",
        info: "Percentage of residents living below the federal poverty line (FPL)",
        aggregate: "mean",
        formatter: pct,
        group: "Socioeconimic Status",
        tertile_direction: "ascending",
      },
      {
        field: "unemployed",
        title: "Unemployed",
        info: "Percentage of residents unemployed",
        aggregate: "mean",
        formatter: pct,
        group: "Socioeconimic Status",
        tertile_direction: "ascending",
      },
      {
        field: "income",
        title: "Household Income",
        info: "Average household income",
        aggregate: "mean",
        formatter: dollar,
        group: "Socioeconimic Status",
        tertile_direction: "descending",
      },
      {
        field: "no_high_school_diploma",
        title: "No HS Diploma",
        info: "Percent of adult residents without a high school diploma or equivalent",
        aggregate: "mean",
        formatter: pct,
        group: "Socioeconimic Status",
        tertile_direction: "ascending",
      },
      {
        field: "age_65_older",
        title: "Age Over 65",
        info: "Percent of residents over the age of 65",
        aggregate: "mean",
        formatter: pct,
        group: "Household Composition",
        tertile_direction: "ascending",
      },
      {
        field: "age_17_younger",
        title: "Age Under 17",
        info: "Percent of residents under the age of 17",
        aggregate: "mean",
        formatter: pct,
        group: "Household Composition",
        tertile_direction: "ascending",
      },
      {
        field: "household_with_disability",
        title: "Household w/Disability",
        info: "Percent of households with at least one member with a disability",
        aggregate: "mean",
        formatter: pct,
        group: "Household Composition",
        tertile_direction: "ascending",
      },
      {
        field: "single_parent_households",
        title: "Single Parent",
        info: "Percent of households with a single parent",
        aggregate: "mean",
        formatter: pct,
        group: "Household Composition",
        tertile_direction: "ascending",
      },
      {
        field: "minority",
        title: "Minority",
        info: "Percent of minority residents",
        aggregate: "mean",
        formatter: pct,
        group: "Minority Status & Language",
        tertile_direction: "ascending",
      },
      {
        field: "no_english",
        title: "No English",
        info: "Percent of residents who do not speak english",
        aggregate: "mean",
        formatter: pct,
        group: "Minority Status & Language",
        tertile_direction: "ascending",
      },
      {
        field: "multi_unit_structures",
        title: "Multi-Unit Stuctures",
        info: "Percent of residential buildings which contain multiple units",
        aggregate: "mean",
        formatter: pct,
        group: "Housing Type & Transportation",
        tertile_direction: "ascending",
      },
      {
        field: "mobile_homes",
        title: "Mobile Homes",
        info: "Percent of residential buildings which are mobile homes",
        aggregate: "mean",
        formatter: pct,
        group: "Housing Type & Transportation",
        tertile_direction: "ascending",
      },
      {
        field: "crowded_housing",
        title: "Crowded Housing",
        info: "Percent of households which are crowded",
        aggregate: "mean",
        formatter: pct,
        group: "Housing Type & Transportation",
        tertile_direction: "ascending",
      },
      {
        field: "no_vehicle",
        title: "No Vehicle",
        info: "Percent of households without a personal vehicle",
        aggregate: "mean",
        formatter: pct,
        group: "Housing Type & Transportation",
        tertile_direction: "ascending",
      },
    ];

    if (withPredictions.value)
      metrics.push({
        field: "flag_1",
        title: "PROVIDENT Prediction",
        info: "Whether the block group was flagged by PROVIDENT",
        aggregate: "sum",
        formatter: (x) => x,
        group: "PROVIDENT Prediction",
        tertile_direction: "ascending",
      });

    const statFns = {};
    for (const metric of metrics) {
      statFns[metric.field] = aq.op[metric.aggregate](metric.field);
    }

    const tertileFns = {};
    for (const metric of metrics) {
      tertileFns[metric.field + "_lower"] = aq.op.quantile(metric.field, 0.33);
      tertileFns[metric.field + "_upper"] = aq.op.quantile(metric.field, 0.67);
    }

    const { stats: current } = useStats({
      statFns,
      tertileFns,
      dataset,
      municipality,
      geoid,
    });

    console.log(current.value);

    return {
      current,
      metrics,
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
