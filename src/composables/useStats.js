import { computed } from "vue";
import * as aq from "arquero";

aq.addFunction("round_tertile", (x) => {
  if (x <= 1.5) {
    return 1;
  } else if (x >= 2.5) {
    return 3;
  } else {
    return 2;
  }
});

export function useStats({
  metrics,
  groupedMetrics = {},
  dataset,
  municipality,
  geoid,
  withTertiles = true,
}) {
  const dt = computed(() => {
    return aq.from(dataset.value);
  });

  const isData = computed(() => dt.value.numRows() > 0);

  const statFns = {};
  for (const metric of metrics) {
    statFns[metric.field] = aq.op[metric.aggregate](metric.field);
  }

  const tertileFns = {};
  if (withTertiles) {
    for (const metric of metrics) {
      tertileFns[metric.field + "_lower"] = aq.op.quantile(metric.field, 0.33);
      tertileFns[metric.field + "_upper"] = aq.op.quantile(metric.field, 0.67);
    }
  }

  const calcTertile = {};
  if (withTertiles) {
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
  }

  const groupTertile = {};
  if (withTertiles) {
    for (const [group, groupMetrics] of Object.entries(groupedMetrics)) {
      const meanString =
        "aq.op.round_tertile((" +
        groupMetrics.map((m) => `d['${m.field}_tertile']`).join(" + ") +
        `) / ${groupMetrics.length})`;
      groupTertile[group + "_tertile"] = `d => ${meanString}`;
    }
  }

  const tertiles = computed(() => {
    if (isData.value && withTertiles) {
      return dt.value.rollup(tertileFns);
    } else {
      return aq.from([]);
    }
  });

  const ri = computed(() => {
    if (isData.value) {
      return dt.value
        .rollup(statFns)
        .derive({ area: () => "RI" })
        .cross(tertiles.value)
        .derive(calcTertile)
        .derive(groupTertile)
        .objects()[0];
    } else {
      return [];
    }
  });

  const munis = computed(() => {
    if (isData.value) {
      return dt.value
        .groupby("municipality")
        .rollup(statFns)
        .derive({ area: (d) => d.municipality })
        .cross(tertiles.value)
        .derive(calcTertile)
        .derive(groupTertile)
        .objects();
    } else {
      return [];
    }
  });

  const bgs = computed(() => {
    if (isData.value) {
      return dt.value
        .derive({ area: (d) => d.bg_id })
        .cross(tertiles.value)
        .derive(calcTertile)
        .derive(groupTertile)
        .objects();
    } else {
      return [];
    }
  });

  const muni = computed(() => {
    return munis.value.find((o) => o.municipality === municipality.value) ?? {};
  });

  const bg = computed(() => {
    return bgs.value.find((o) => o.bg_id === geoid.value) ?? {};
  });

  const stats = computed(() => {
    return {
      ri: ri.value,
      municipality: muni.value,
      geoid: bg.value,
    };
  });

  return { stats };
}
