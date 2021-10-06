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

  <!-- fix table column widths so it doesn't change with the data -->
  <table class="table is-striped is-fullwidth">
    <thead>
      <tr>
        <th class="has-text-right">Metric</th>
        <th class="data-column"><abbr :title="geoid">BG</abbr></th>
        <th class="data-column"><abbr :title="municipality">Town</abbr></th>
        <th class="data-column"><abbr title="Rhode Island">RI</abbr></th>
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
              :stats="current.geoid"
              :number="false"
              :location="geoid"
              :icon="false"
            />
          </td>
          <td class="data-column has-text-center">
            <StatsTableIcon
              :metric="group"
              :stats="current.municipality"
              :number="false"
              :location="municipality"
              :icon="false"
            />
          </td>
          <td class="data-column has-text-center">
            <StatsTableIcon
              :metric="group"
              :stats="current.ri"
              :number="false"
              location="RI"
              :icon="false"
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
                :stats="current.geoid"
                :location="geoid"
                :icon="false"
              />
            </td>
            <td class="data-column has-text-center">
              <StatsTableIcon
                :metric="metric.field"
                :format-fn="metric.formatter"
                :stats="current.municipality"
                :location="municipality"
                :icon="false"
              />
            </td>
            <td class="data-column has-text-center">
              <StatsTableIcon
                :metric="metric.field"
                :format-fn="metric.formatter"
                :stats="current.ri"
                location="RI"
                :icon="false"
              />
            </td>
          </tr>
        </template>
      </template>
    </tbody>
  </table>
</template>

<script>
import { toRefs, reactive, computed } from "vue";
import * as aq from "arquero";
import { format } from "d3-format";

import { useStats } from "@/composables/useStats.js";
import StatsTableIcon from "@/components/dashboard/StatsTableIcon.vue";
import LabelledTag from "@/components/dashboard/LabelledTag.vue";

export default {
  components: {
    StatsTableIcon,
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
    const showGroups = reactive({});
    let showGroup = true; // want to show the first group
    for (const metric of metrics) {
      if (groupedMetrics[metric.group] === undefined) {
        groupedMetrics[metric.group] = [metric];
        showGroups[metric.group] = showGroup;
        showGroup = false;
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
        ] = `d => d['${metric.field}'] > d['${metric.field}_upper'] ? 3 : (d['${metric.field}'] >= d['${metric.field}_lower'] ? 2 : 1)`;
      } else {
        calcTertile[
          metric.field + "_tertile"
        ] = `d => d['${metric.field}'] > d['${metric.field}_upper'] ? 1 : (d['${metric.field}'] >= d['${metric.field}_lower'] ? 2 : 3)`;
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

    const prediction = computed(() => current.value.geoid?.flag_1 ?? "-");

    return {
      current,
      prediction,
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
