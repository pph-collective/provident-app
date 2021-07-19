import { computed } from "vue";
import * as aq from "arquero";

export function useStats({
  statFns,
  tertileFns,
  dataset,
  municipality,
  geoid,
}) {
  const dt = computed(() => {
    return aq.from(dataset.value);
  });

  const isData = computed(() => dt.value.numRows() > 0);

  const tertiles = computed(() => {
    if (isData.value) {
      return dt.value.rollup(tertileFns);
    } else {
      return [];
    }
  });

  const ri = computed(() => {
    if (isData.value) {
      return dt.value
        .rollup(statFns)
        .derive({ area: () => "RI" })
        .cross(tertiles.value)
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
