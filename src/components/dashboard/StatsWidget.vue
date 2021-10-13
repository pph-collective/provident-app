<template>
  <div class="is-flex is-flex-wrap-wrap is-justify-content-space-between">
    <LabelledTag label="Municipality" :value="municipality" min-width="110px" />
    <LabelledTag label="Block Group" :value="geoid" min-width="55px" />
  </div>

  <LabelledTag
    v-if="withPredictions"
    class="my-2"
    label="PROVIDENT Prediction"
    :value="prediction"
    min-width="55px"
  />

  <StatsTable
    :stats="current"
    :grouped-metrics="groupedMetrics"
    :geoid="geoid"
    :municipality="municipality"
  />
</template>

<script>
import { toRefs, computed } from "vue";
import { format } from "d3-format";

import { useStats } from "@/composables/useStats.js";
import StatsTable from "@/components/dashboard/StatsTable.vue";
import LabelledTag from "@/components/dashboard/LabelledTag.vue";

export default {
  components: {
    StatsTable,
    LabelledTag,
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
    const { dataset, geoid, municipality } = toRefs(props);

    // number formatters
    const pct = (x) => (x > 0 && x < 0.01 ? "<1%" : format(".0%")(x));
    const dollar = (x) => (x > 100000 ? format("$.3s")(x) : format("$.2s")(x));

    const metrics = [
      {
        field: "below_poverty",
        title: "Below FPL",
        info: "Percentage of residents living below the federal poverty line (FPL)",
        aggregate: "median",
        formatter: pct,
        group: "Socioeconimic Status",
        tertile_direction: "ascending",
      },
      {
        field: "unemployed",
        title: "Unemployed",
        info: "Percentage of residents unemployed",
        aggregate: "median",
        formatter: pct,
        group: "Socioeconimic Status",
        tertile_direction: "ascending",
      },
      {
        field: "income",
        title: "Household Income",
        info: "Average household income",
        aggregate: "median",
        formatter: dollar,
        group: "Socioeconimic Status",
        tertile_direction: "descending",
      },
      {
        field: "no_high_school_diploma",
        title: "No HS Diploma",
        info: "Percent of adult residents without a high school diploma or equivalent",
        aggregate: "median",
        formatter: pct,
        group: "Socioeconimic Status",
        tertile_direction: "ascending",
      },
      {
        field: "age_65_older",
        title: "Age Over 65",
        info: "Percent of residents over the age of 65",
        aggregate: "median",
        formatter: pct,
        group: "Household Composition",
        tertile_direction: "ascending",
      },
      {
        field: "age_17_younger",
        title: "Age Under 17",
        info: "Percent of residents under the age of 17",
        aggregate: "median",
        formatter: pct,
        group: "Household Composition",
        tertile_direction: "ascending",
      },
      {
        field: "household_with_disability",
        title: "Household w/Disability",
        info: "Percent of households with at least one member with a disability",
        aggregate: "median",
        formatter: pct,
        group: "Household Composition",
        tertile_direction: "ascending",
      },
      {
        field: "single_parent_households",
        title: "Single Parent",
        info: "Percent of households with a single parent",
        aggregate: "median",
        formatter: pct,
        group: "Household Composition",
        tertile_direction: "ascending",
      },
      {
        field: "minority",
        title: "Minority",
        info: "Percent of minority residents",
        aggregate: "median",
        formatter: pct,
        group: "Minority Status & Language",
        tertile_direction: "ascending",
      },
      {
        field: "no_english",
        title: "Non-English Speaker",
        info: "Percent of residents who do not speak english",
        aggregate: "median",
        formatter: pct,
        group: "Minority Status & Language",
        tertile_direction: "ascending",
      },
      {
        field: "multi_unit_structures",
        title: "Multi-Unit Stuctures",
        info: "Percent of residential buildings which contain multiple units",
        aggregate: "median",
        formatter: pct,
        group: "Housing Type & Transportation",
        tertile_direction: "ascending",
      },
      {
        field: "mobile_homes",
        title: "Mobile Homes",
        info: "Percent of residential buildings which are mobile homes",
        aggregate: "median",
        formatter: pct,
        group: "Housing Type & Transportation",
        tertile_direction: "ascending",
      },
      {
        field: "crowded_housing",
        title: "Crowded Housing",
        info: "Percent of households which are crowded",
        aggregate: "median",
        formatter: pct,
        group: "Housing Type & Transportation",
        tertile_direction: "ascending",
      },
      {
        field: "no_vehicle",
        title: "No Vehicle",
        info: "Percent of households without a personal vehicle",
        aggregate: "median",
        formatter: pct,
        group: "Housing Type & Transportation",
        tertile_direction: "ascending",
      },
    ];

    const groupedMetrics = {};
    for (const metric of metrics) {
      if (groupedMetrics[metric.group] === undefined) {
        groupedMetrics[metric.group] = [metric];
      } else {
        groupedMetrics[metric.group].push(metric);
      }
    }

    const { stats: current } = useStats({
      metrics,
      groupedMetrics,
      dataset,
      municipality,
      geoid,
    });

    const prediction = computed(() => current.value.geoid?.flag_1 ?? "-");

    return {
      current,
      prediction,
      metrics,
      groupedMetrics,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "bulma";
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
  min-width: 48px;
  padding-left: 2px !important;
  padding-right: 2px !important;
  text-align: center !important;
}

/* Tooltip container */
.tooltip {
  position: relative;
  display: inline-block;
}

/* Tooltip text */
.tooltip .tooltiptext {
  visibility: hidden;
  width: 180px;
  bottom: 100%;
  left: 50%;
  margin-left: -90px;
  background-color: $grey-dark;
  color: #fff;
  text-align: center;
  padding: 5px 5px;
  border-radius: 3px;

  /* Position the tooltip text - see examples below! */
  position: absolute;
  z-index: 1;
}

/* Show the tooltip text when you mouse over the tooltip container */
.tooltip:hover .tooltiptext {
  visibility: visible;
}
</style>
