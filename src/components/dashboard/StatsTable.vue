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
            :stats="stats.current.ri"
            :previous-stats="stats.previous.ri"
            location="RI"
          />
        </td>
        <td class="data-column">
          <StatsTableIcon
            :metric="metric"
            :stats="stats.current.municipality"
            :previous-stats="stats.previous.municipality"
            :location="municipality"
          />
        </td>
        <td class="data-column">
          <StatsTableIcon
            :metric="metric"
            :stats="stats.current.geoid"
            :previous-stats="stats.previous.geoid"
            :location="geoid"
          />
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { toRefs, computed } from "vue";
import * as aq from "arquero";
// import { format } from "d3-format";

import StatsTableIcon from "@/components/dashboard/StatsTableIcon.vue";

export default {
  components: {
    StatsTableIcon
  },
  props: {
    dataset: {
      type: Array,
      required: true
    },
    previousDataset: {
      type: Array,
      required: true
    },
    municipality: {
      type: String,
      required: false,
      default: ""
    },
    geoid: {
      type: String,
      required: false,
      default: ""
    }
  },

  setup(props) {
    const { dataset, geoid, municipality, previousDataset } = toRefs(props);

    const metrics = {
      mean: ["pct_demographic_1", "pct_demographic_2"],
      sum: ["flag_1"]
    };

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

    const dt = computed(() => {
      return aq.from(dataset.value);
    });

    const previousDt = computed(() => {
      return aq.from(previousDataset.value);
    });

    const isPreviousData = computed(() => {
      return previousDt.value.numRows() > 0;
    });

    const tertiles = computed(() => {
      return dt.value.rollup(tertileFns);
    });

    const previousTertiles = computed(() => {
      if (isPreviousData.value) {
        return previousDt.value.rollup(tertileFns);
      } else {
        return [];
      }
    });

    const ri = computed(() => {
      return dt.value
        .rollup(statFns)
        .derive({ area: () => "RI" })
        .cross(tertiles.value)
        .objects()[0];
    });

    const previousRi = computed(() => {
      if (isPreviousData.value) {
        return previousDt.value
          .rollup(statFns)
          .derive({ area: () => "RI" })
          .cross(previousTertiles.value)
          .objects()[0];
      } else {
        return {};
      }
    });

    const munis = computed(() => {
      return dt.value
        .groupby("municipality")
        .rollup(statFns)
        .derive({ area: d => d.municipality })
        .cross(tertiles.value)
        .objects();
    });

    const previousMunis = computed(() => {
      if (isPreviousData.value) {
        return previousDt.value
          .groupby("municipality")
          .rollup(statFns)
          .derive({ area: d => d.municipality })
          .cross(previousTertiles.value)
          .objects();
      } else {
        return [];
      }
    });

    const bgs = computed(() => {
      return dt.value
        .derive({ area: d => d.bg_id })
        .cross(tertiles.value)
        .objects();
    });

    const previousBgs = computed(() => {
      if (isPreviousData.value) {
        return previousDt.value
          .derive({ area: d => d.bg_id })
          .cross(previousTertiles.value)
          .objects();
      } else {
        return [];
      }
    });

    const muni = computed(() => {
      return munis.value.find(o => o.municipality === municipality.value) ?? {};
    });

    const previousMuni = computed(() => {
      return (
        previousMunis.value.find(o => o.municipality === municipality.value) ??
        {}
      );
    });

    const bg = computed(() => {
      return bgs.value.find(o => o.bg_id === geoid.value) ?? {};
    });

    const previousBg = computed(() => {
      return previousBgs.value.find(o => o.bg_id === geoid.value) ?? {};
    });

    const stats = computed(() => {
      return {
        current: {
          ri: ri.value,
          municipality: muni.value,
          geoid: bg.value
        },
        previous: {
          ri: previousRi.value,
          municipality: previousMuni.value,
          geoid: previousBg.value
        }
      };
    });

    return {
      stats,
      metricsList
    };
  }
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
