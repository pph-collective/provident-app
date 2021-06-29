<template>
  <table class="table is-family-secondary">
    <thead>
      <tr>
        <th>Metric</th>
        <th>RI</th>
        <th>{{ municipality }}</th>
        <th>{{ geoid }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="metric in metricsList" :key="metric">
        <th>{{ metric }}</th>
        <td>{{ formatNumber(stats.ri[metric]) }}</td>
        <td>{{ formatNumber(stats.municipality[metric]) }}</td>
        <td>{{ formatNumber(stats.geoid[metric]) }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { toRefs, computed } from "vue";
import * as aq from "arquero";
import { format } from "d3-format";

export default {
  props: {
    dataset: {
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
    const { dataset, geoid, municipality } = toRefs(props);

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

    const formatNumber = format(".1~f");

    const dt = computed(() => {
      return aq.from(dataset.value);
    });

    const ri = computed(() => {
      return dt.value
        .rollup(statFns)
        .derive({ area: () => "RI" })
        .objects()[0];
    });

    const muni = computed(() => {
      return dt.value
        .filter(`d => d.municipality === '${municipality.value}'`)
        .rollup(statFns)
        .derive({ area: `'${municipality.value}'` })
        .objects()[0];
    });

    const bg = computed(() => {
      return dt.value
        .filter(`d => d.bg_id === '${geoid.value}'`)
        .rollup(statFns)
        .derive({ area: `'${geoid.value}'` })
        .objects()[0];
    });

    const stats = computed(() => {
      return {
        ri: ri.value,
        municipality: muni.value,
        geoid: bg.value
      };
    });

    return {
      stats,
      metricsList,
      formatNumber
    };
  }
};
</script>
