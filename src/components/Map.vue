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
    filterMunicipalities: {
      type: Array,
      default() {
        return [];
      }
    },
    flagProperty: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const { minHeight, filterMunicipalities, dataset, flagProperty } = toRefs(
      props
    );

    const el = ref(null);

    // filter geo data and simplify
    const filteredGeo = computed(() => {
      let filtered = geo;
      if (filterMunicipalities.value.length > 0) {
        filtered = geo.filter(g =>
          filterMunicipalities.value.includes(g.properties.name)
        );
      }

      filtered.forEach(g => {
        g.properties.flag = dataset.value.find(d => d.geoid === g.id)[
          flagProperty.value
        ];
      });

      const collection = {
        blocks: { type: "FeatureCollection", features: filtered }
      };

      let topo = topology.topology(collection, 1e5);

      // simplify/smooth out the geometry a bit
      const sphericalArea = 1e-9;
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

    // TODO: pick a map
    const spec = computed(() => {
      return {
        $schema: "https://vega.github.io/schema/vega/v5.json",
        background: "transparent",
        signals: [
          {
            name: "tileUrl",
            value: "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/"
          },
          {
            name: "mapboxToken",
            value:
              "?access_token=pk.eyJ1IjoiY2N2LWJvdCIsImEiOiJja2psa25za3EyZnQzMnVwOGppMGdsZzJrIn0.D_PRajmte3m3XXebngMMpQ"
          },
          { name: "basePoint", update: "invert('projection',[0,0])" },
          { name: "maxPoint", update: "invert('projection', [width, height])" },
          {
            name: "geoWidth",
            update: "width / abs(basePoint[0] - maxPoint[0])"
          },
          {
            name: "zoom",
            update:
              "geoWidth < 750 ? 9 : (geoWidth < 1500 ? 10 : (geoWidth < 3000 ? 11 : 12))"
          },
          { name: "tilesCount", update: "pow(2,zoom)" },
          { name: "dii", update: "((basePoint[0]+180)/360*tilesCount)" },
          { name: "di", update: "floor(dii)" },
          {
            name: "djj",
            update:
              "((1-log(tan(basePoint[1]*PI/180) + 1/cos(basePoint[1]*PI/180))/PI)/2 *tilesCount)"
          },
          { name: "dj", update: "floor(djj)" },
          { name: "phi", update: "(1 - dj / tilesCount) * 2 * PI - PI" },
          {
            name: "tileSize",
            update:
              "scale('projection', [(di+1) * 360 / tilesCount + 180, 0])[0] - scale('projection', [(di) * 360 / tilesCount + 180, 0])[0]"
          },
          { name: "maxTiles", update: "ceil(max(height,width)/tileSize +1)" },
          {
            name: "offset",
            update:
              "scale('projection',[di * 360 / tilesCount + 180, atan((pow(E, phi) - pow(E, -1 * phi)) / 2) / PI * 180])"
          }
        ],
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
          },
          {
            name: "tile_list",
            transform: [
              { type: "sequence", start: 0, stop: { signal: "maxTiles" } },
              { type: "cross", filter: "(datum.a.data>=0)&(datum.b.data>=0)" },
              {
                type: "formula",
                as: "url",
                expr:
                  "tileUrl+zoom+'/'+(datum.a.data+di+tilesCount)%tilesCount+ '/'+((datum.b.data+dj)) + mapboxToken"
              },
              {
                type: "formula",
                as: "x",
                expr: "datum.a.data*tileSize + offset[0]"
              },
              {
                type: "formula",
                as: "y",
                expr: "datum.b.data*tileSize + offset[1]"
              }
            ]
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
            type: "image",
            from: { data: "tile_list" },
            clip: true,
            encode: {
              update: {
                url: { field: "url" },
                x: { field: "x" },
                y: { field: "y" },
                width: { signal: "tileSize" },
                height: { signal: "tileSize" },
                zindex: { value: 1 }
              }
            }
          },
          {
            type: "shape",
            from: { data: "bg_outlines" },
            encode: {
              enter: {
                strokeWidth: { value: 1 },
                stroke: { value: "#d3d3d3" },
                fill: [
                  { test: "datum.properties.flag === '1'", value: "red" },
                  { value: "transparent" }
                ]
              },
              update: {
                tooltip: {
                  signal:
                    "{ Municipality: datum.properties.name, 'Block Group': datum.id, Flag: datum.properties.flag }"
                }
              }
            },
            transform: [{ type: "geoshape", projection: "projection" }]
          },
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
          }
        ]
      };
    });

    useVega({
      spec,
      el,
      minHeight,
      includeActions: ref(false)
    });

    return {
      el
    };
  }
};
</script>
