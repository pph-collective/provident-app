<template>
  <div ref="el"></div>
</template>

<script>
import { ref, toRefs, computed } from "vue";

import * as topology from "topojson-server";
import * as tc from "topojson-client";
import * as ts from "topojson-simplify";
const topojson = Object.assign(ts, tc);

import { useVega } from "@/composables/useVega.js";
import geo from "@/assets/geojson/ri.json";

export default {
  name: "Map",
  props: {
    dataset: {
      type: Array,
      required: true
    },
    minHeight: {
      type: Number,
      default: 720
    },
    filterTowns: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  setup(props) {
    const { minHeight, filterTowns } = toRefs(props);

    const el = ref(null);

    // filter geo data and simplify
    const filteredGeo = computed(() => {
      let filtered = geo;
      if (filterTowns.value.length > 0) {
        filtered = geo.filter(g =>
          filterTowns.value.includes(g.properties.name)
        );
      }

      const collection = {
        blocks: { type: "FeatureCollection", features: filtered }
      };

      let topo = topology.topology(collection, 1e5);

      // simplify/smooth out the geometry a bit
      const sphericalArea = 5e-9;
      topo = topojson.presimplify(topo, topojson.sphericalTriangleArea);
      topo = topojson.simplify(topo, sphericalArea);
      topo = topojson.filter(
        topo,
        topojson.filterAttachedWeight(
          topo,
          sphericalArea,
          topojson.sphericalRingArea
        )
      );

      // merge block groups into town as well
      let target = (topo.objects["towns"] = {
        type: "GeometryCollection",
        geometries: []
      });
      let geometries = target.geometries;

      const geometriesByKey = {};
      topo.objects["blocks"].geometries.forEach(geometry => {
        let k = geometry.properties.name;
        if (geometriesByKey[k]) geometriesByKey[k].push(geometry);
        else geometriesByKey[k] = [geometry];
      });

      for (let k in geometriesByKey) {
        let o = topojson.mergeArcs(topo, geometriesByKey[k]);
        o.id = k;
        o.properties = { name: k };
        geometries.push(o);
      }

      return topo;
    });

    const hasData = computed(() => {
      return Object.keys(filteredGeo.value).length > 0;
    });

    const spec = computed(() => {
      return {
        $schema: "https://vega.github.io/schema/vega/v5.json",
        background: "transparent",
        data: [
          {
            name: "town_outlines",
            values: filteredGeo.value,
            format: { type: "topojson", feature: "towns" }
          },
          {
            name: "bg_outlines",
            values: filteredGeo.value,
            format: { type: "topojson", feature: "blocks" }
          }
        ],
        projections: [
          {
            name: "projection",
            type: "mercator",
            size: { signal: "[width, height]" },
            fit: { signal: 'data("town_outlines")' }
          }
        ],
        marks: [
          {
            type: "shape",
            from: { data: "town_outlines" },
            encode: {
              enter: {
                strokeWidth: { value: 3 },
                stroke: { value: "#d3d3d3" },
                fill: { value: "transparent" }
              }
            },
            transform: [{ type: "geoshape", projection: "projection" }]
          },
          {
            type: "shape",
            from: { data: "bg_outlines" },
            encode: {
              enter: {
                strokeWidth: { value: 1 },
                stroke: { value: "#d3d3d3" },
                fill: { value: "transparent" }
              },
              update: {
                tooltip: {
                  signal:
                    "{Municipality: datum.properties.name, 'Block Group': datum.id}"
                }
              }
            },
            transform: [{ type: "geoshape", projection: "projection" }]
          }
        ]
      };
    });

    useVega({
      spec,
      el,
      hasData,
      minHeight
    });

    return {
      el
    };
  }
};
</script>
