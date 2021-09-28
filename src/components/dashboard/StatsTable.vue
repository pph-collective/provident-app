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
    <tbody class="is-size-6-7">
      <template v-for="(metrics, group) in groupedMetrics" :key="group">
        <!-- group level row -->
        <tr
          @click="showGroups[group] = !showGroups[group]"
          class="is-clickable"
        >
          <th
            class="
              has-text-right has-text-bold
              is-flex is-justify-content-space-between is-align-items-center
            "
          >
            <span class="icon">
              <i
                class="fas"
                :class="[
                  showGroups[group] ? 'fa-caret-down' : 'fa-caret-right',
                ]"
              />
            </span>
            <span>
              {{ group }}
            </span>
          </th>
          <td class="data-column has-text-center">
            <StatsTableIcon
              :metric="group"
              :stats="current.ri"
              :icon-only="true"
              location="RI"
            />
          </td>
          <td class="data-column has-text-center">
            <StatsTableIcon
              :metric="group"
              :stats="current.municipality"
              :icon-only="true"
              :location="municipality"
            />
          </td>
          <td class="data-column has-text-center">
            <StatsTableIcon
              :metric="group"
              :stats="current.geoid"
              :icon-only="true"
              :location="geoid"
            />
          </td>
        </tr>

        <!-- group detail rows -->
        <template v-if="showGroups[group]">
          <tr v-for="metric in metrics" :key="metric">
            <th
              class="
                has-text-right has-text-weight-medium
                is-flex is-justify-content-end is-align-items-center
              "
            >
              <span>
                {{ metric.title }}
              </span>
              <span class="tooltip icon is-small has-text-info">
                <i class="fas fa-xs fa-info-circle" />
                <span class="tooltiptext">{{ metric.info }}</span>
              </span>
            </th>
            <td class="data-column has-text-center">
              <StatsTableIcon
                :metric="metric.field"
                :format-fn="metric.formatter"
                :stats="current.ri"
                location="RI"
              />
            </td>
            <td class="data-column has-text-center">
              <StatsTableIcon
                :metric="metric.field"
                :format-fn="metric.formatter"
                :stats="current.municipality"
                :location="municipality"
              />
            </td>
            <td class="data-column has-text-center">
              <StatsTableIcon
                :metric="metric.field"
                :format-fn="metric.formatter"
                :stats="current.geoid"
                :location="geoid"
              />
            </td>
          </tr>
        </template>
      </template>
    </tbody>
  </table>
</template>

<script>
import { toRefs, reactive } from "vue";
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

    const groupedMetrics = {};
    const showGroups = reactive({});
    for (const metric of metrics) {
      if (groupedMetrics[metric.group] === undefined) {
        groupedMetrics[metric.group] = [metric];
        showGroups[metric.group] = false;
      } else {
        groupedMetrics[metric.group].push(metric);
      }
    }

    const statFns = {};
    for (const metric of metrics) {
      statFns[metric.field] = aq.op[metric.aggregate](metric.field);
    }

    const tertileFns = {};
    for (const metric of metrics) {
      tertileFns[metric.field + "_lower"] = aq.op.quantile(metric.field, 0.33);
      tertileFns[metric.field + "_upper"] = aq.op.quantile(metric.field, 0.67);
    }

    const calcTertile = {};
    for (const metric of metrics) {
      if (metric.tertile_direction === "ascending") {
        calcTertile[
          metric.field + "_tertile"
        ] = `d => d['${metric.field}'] <= d['${metric.field}_lower'] ? 1 : (d['${metric.field}'] <= d['${metric.field}_upper'] ? 2 : 3)`;
      } else {
        calcTertile[
          metric.field + "_tertile"
        ] = `d => d['${metric.field}'] >= d['${metric.field}_upper'] ? 1 : (d['${metric.field}'] >= d['${metric.field}_lower'] ? 2 : 3)`;
      }
    }

    const groupTertile = {};
    for (const [group, groupMetrics] of Object.entries(groupedMetrics)) {
      const meanString =
        "aq.op.round((" +
        groupMetrics.map((m) => `d['${m.field}_tertile']`).join(" + ") +
        `) / ${groupMetrics.length})`;
      groupTertile[group + "_tertile"] = `d => ${meanString}`;
    }

    const { stats: current } = useStats({
      statFns,
      tertileFns,
      dataset,
      municipality,
      geoid,
      calcTertile,
      groupTertile,
    });

    return {
      current,
      groupedMetrics,
      showGroups,
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
  min-width: 65px;
  padding-left: 2px !important;
  padding-right: 2px !important;
  text-align: center !important;
}

// between size 6 and 7
.is-size-6-7 {
  font-size: 0.825rem;
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
