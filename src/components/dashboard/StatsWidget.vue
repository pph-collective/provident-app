<template>
  <div>
    <p>
      When you select a neighborhood, you can use the table below to compare its
      characteristics to town and state values.
    </p>
    <br />
  </div>
  <div
    class="is-flex is-flex-direction-column is-justify-content-space-between is-fullheight"
  >
    <div>
      <div class="is-flex is-flex-wrap-wrap is-justify-content-start">
        <LabelledTag
          label="Municipality"
          :value="municipality"
          :link="
            municipality
              ? `https://ridoh-overdose-surveillance-rihealth.hub.arcgis.com/documents/ri-municipality-overdose-data-report-${hyphenate(
                  municipality,
                )}/explore`
              : ''
          "
          min-width="110px"
        />
        <LabelledTag label="Block Group" :value="geoid" min-width="55px" />
      </div>

      <PriorityTag :priority="priority" />

      <br />

      <table class="table is-striped is-fullwidth my-1">
        <thead>
          <tr>
            <th />
            <th class="py-1 px-0">
              <abbr :title="geoid">BG</abbr>
            </th>
            <th class="py-1 px-0">
              <abbr :title="municipality">Town</abbr>
            </th>
            <th class="py-1 px-0">
              <abbr title="Rhode Island">RI</abbr>
            </th>
          </tr>
        </thead>
        <!-- community composition statistics -->
        <StatsTableContent
          :stats="communityStats"
          :grouped-metrics="{ communityComposition }"
          :geoid="geoid"
          :municipality="municipality"
          :grouped="false"
          title="Community Composition"
        />

        <!-- tertiled/grouped statistics -->
        <StatsTableContent
          :stats="current"
          :grouped-metrics="groupedMetrics"
          :geoid="geoid"
          :municipality="municipality"
          title="Social Vulnerability Indicators"
        />
      </table>
    </div>

    <StatsTableLegend />
  </div>
</template>

<script setup>
import { computed, toRef } from "vue";
import { format } from "d3-format";

import { useStats } from "@/composables/useStats.js";
import StatsTableContent from "@/components/dashboard/StatsTableContent.vue";
import StatsTableLegend from "@/components/dashboard/StatsTableLegend.vue";
import LabelledTag from "@/components/dashboard/LabelledTag.vue";
import PriorityTag from "@/components/dashboard/PriorityTag.vue";

const props = defineProps({
  dataset: {
    type: Object,
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
});

// number formatters
const pct = (x) => (x > 0 && x < 0.01 ? "<1%" : format(".0%")(x));

const metrics = [
  {
    field: "below_poverty",
    title: "Poverty Status",
    info: "People living in poverty have very little money to meet their basic needs for things like housing and food.",
    aggregate: "median",
    formatter: pct,
    group: "Economic Resources",
    tertile_direction: "ascending",
  },
  {
    field: "unemployed",
    title: "Unemployment Rate",
    info: "People who are unemployed can work and are looking for a job but haven’t been able to get one yet.",
    aggregate: "median",
    formatter: pct,
    group: "Economic Resources",
    tertile_direction: "ascending",
  },
  {
    field: "housing_burden",
    title: "Rent Burden",
    info: "Households that put more than 30% of their income towards rent will have very little money left over.",
    aggregate: "median",
    formatter: pct,
    group: "Economic Resources",
    tertile_direction: "ascending",
  },
  {
    field: "no_vehicle",
    title: "No Vehicle Available",
    info: "Households without any cars need to rely on public transportation to get around.",
    aggregate: "median",
    formatter: pct,
    group: "Economic Resources",
    tertile_direction: "ascending",
  },
  {
    field: "living_alone",
    title: "Living Alone",
    info: "People who live alone may not have someone nearby who can check on them in an emergency.",
    aggregate: "median",
    formatter: pct,
    group: "Housing Environments",
    tertile_direction: "ascending",
  },
  {
    field: "crowded_housing",
    title: "Crowded Housing",
    info: "People who live in crowded households might have trouble affording enough space to live comfortably.",
    aggregate: "median",
    formatter: pct,
    group: "Housing Environments",
    tertile_direction: "ascending",
  },
  {
    field: "internet",
    title: "Internet Access",
    info: "People without Internet access might have trouble finding resources or making appointments online.",
    aggregate: "median",
    formatter: pct,
    group: "Housing Environments",
    tertile_direction: "descending",
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
  dataset: toRef(() => props.dataset),
  municipality: toRef(() => props.municipality),
  geoid: toRef(() => props.geoid),
});

const communityComposition = [
  {
    field: "race_aian",
    title: "American Indian / Alaska Native",
    info: "This community includes the Narragansett Indian Reservation in Charlestown, Rhode Island. Most American Indian or Alaska Native Rhode Islanders speak English at home.",
    aggregate: "median",
    formatter: pct,
    group: "Community Composition",
    tertile_direction: "ascending",
  },
  {
    field: "race_asian",
    title: "Asian",
    info: "Many Asian Rhode Islanders are Chinese, Cambodian, Indian, or Laotian. They may speak English, Chinese, Khmer, Hindi, or Lao at home.",
    aggregate: "median",
    formatter: pct,
    group: "Community Composition",
    tertile_direction: "ascending",
  },
  {
    field: "race_black",
    title: "Black / African American",
    info: "Many Black or African American Rhode Islanders are Cape Verdean, Dominican, and Haitian. They may speak English, Portuguese, Spanish, or Haitian Creole at home.",
    aggregate: "median",
    formatter: pct,
    group: "Community Composition",
    tertile_direction: "ascending",
  },
  {
    field: "race_hispanic",
    title: "Hispanic / Latino",
    info: "Many Hispanic or Latino Rhode Islanders are Dominican, Puerto Rican, or Guatemalan. They may speak English or Spanish at home.",
    aggregate: "median",
    formatter: pct,
    group: "Community Composition",
    tertile_direction: "ascending",
  },
  {
    field: "race_nhpi",
    title: "Native Hawaiian / Pacific Islander",
    info: "Many Native Hawaiian or Pacific Islander Rhode Islanders are Filipino. They may speak English or Tagalog at home.",
    aggregate: "median",
    formatter: pct,
    group: "Community Composition",
    tertile_direction: "ascending",
  },
  {
    field: "race_white",
    title: "White",
    info: "Many White Rhode Islanders are Italian, Irish, Portuguese, and French/French Canadian. They may speak English, Portuguese, French, or Italian at home.",
    aggregate: "median",
    formatter: pct,
    group: "Community Composition",
    tertile_direction: "ascending",
  },
];

const { stats: communityStats } = useStats({
  metrics: communityComposition,
  dataset: toRef(() => props.dataset),
  municipality: toRef(() => props.municipality),
  geoid: toRef(() => props.geoid),
  withTertiles: false,
});

const priority = computed(() => {
  if (props.geoid !== "") {
    return (
      props.dataset.cbg.find((row) => row.bg_id === props.geoid)?.tooltip
        .priority ?? "-"
    );
  } else {
    return "";
  }
});

const hyphenate = (val) => {
  return val.toLowerCase().replaceAll(" ", "-");
};
</script>

<style lang="scss" scoped>
.table thead th {
  vertical-align: bottom;
}

.is-fullheight {
  height: 90%;
}
</style>
