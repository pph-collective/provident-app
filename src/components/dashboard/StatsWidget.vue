<template>
  <div
    class="
      is-flex
      is-flex-direction-column
      is-justify-content-space-between
      is-fullheight
    "
  >
    <div>
      <div class="is-flex is-flex-wrap-wrap is-justify-content-space-between">
        <LabelledTag
          label="Municipality"
          :value="municipality"
          :link="
            municipality
              ? `https://ridoh-overdose-surveillance-rihealth.hub.arcgis.com/documents/ri-municipality-overdose-data-report-${hyphenate(
                  municipality
                )}/explore`
              : ''
          "
          min-width="110px"
        />
        <LabelledTag label="Block Group" :value="geoid" min-width="55px" />
      </div>

      <LabelledTag
        v-if="withPredictions"
        class="my-2"
        label="PROVIDENT Prediction"
        :value="prediction"
        min-width="55px"
      />

      <table class="table is-striped is-fullwidth my-1">
        <thead>
          <tr>
            <th></th>
            <th class="py-1"><abbr :title="geoid">BG</abbr></th>
            <th class="py-1"><abbr :title="municipality">Town</abbr></th>
            <th class="py-1"><abbr title="Rhode Island">RI</abbr></th>
          </tr>
        </thead>
        <!-- community cmposition statistics -->
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

<script>
import { toRefs, computed } from "vue";
import { format } from "d3-format";

import { useStats } from "@/composables/useStats.js";
import StatsTableContent from "@/components/dashboard/StatsTableContent.vue";
import StatsTableLegend from "@/components/dashboard/StatsTableLegend.vue";
import LabelledTag from "@/components/dashboard/LabelledTag.vue";

export default {
  components: {
    StatsTableContent,
    StatsTableLegend,
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
        title: "Housing Cost Burden",
        info: "Households that put more than 30% of their income towards rent will have very little money left over.",
        aggregate: "median",
        formatter: pct,
        group: "Economic Resources",
        tertile_direction: "descending",
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
        field: "hispanic",
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
      dataset,
      municipality,
      geoid,
      withTertiles: false,
    });

    const prediction = computed(
      () =>
        dataset.value.find((row) => row.bg_id === geoid.value)?.prediction ??
        "-"
    );

    const hyphenate = (val) => {
      return val.toLowerCase().replaceAll(" ", "-");
    };

    return {
      current,
      hyphenate,
      prediction,
      metrics,
      groupedMetrics,
      communityStats,
      communityComposition,
    };
  },
};
</script>

<style lang="scss" scoped>
.table thead th {
  vertical-align: bottom;
}

.is-fullheight {
  height: 100%;
}
</style>
