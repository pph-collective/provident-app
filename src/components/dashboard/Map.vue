<template>
  <div ref="el"></div>
</template>

<script>
import { ref, toRefs, computed, watch } from "vue";

import * as topology from "topojson-server";
import * as tc from "topojson-client";
import * as ts from "topojson-simplify";
const topojson = { ...ts, ...tc };

import { useVega } from "@/composables/useVega.js";
import geo from "@/assets/geojson/ri.json";

export default {
  props: {
    dataset: {
      type: Array,
      required: true,
    },
    filterMunicipalities: {
      type: Array,
      default() {
        return [];
      },
    },
    flagProperty: {
      type: String,
      required: true,
    },
    withPredictions: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["new-active-bg", "new-active-municipality"],
  setup(props, { emit }) {
    const { filterMunicipalities, dataset, flagProperty, withPredictions } =
      toRefs(props);

    const el = ref(null);

    // filter geo data and simplify
    const filteredGeo = computed(() => {
      let filtered = geo;
      if (filterMunicipalities.value.length > 0) {
        filtered = geo.filter((g) =>
          filterMunicipalities.value.includes(g.properties.name)
        );
      }

      filtered.forEach((g) => {
        const datum = dataset.value.find((d) => d.geoid === g.id) ?? {};
        g.properties.flag = datum[flagProperty.value] ?? "-1";
        g.properties.intervention_arm = datum.intervention_arm ?? false;
      });

      const collection = {
        blocks: { type: "FeatureCollection", features: filtered },
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
        geometries: [],
      });
      let geometries = target.geometries;

      const geometriesByKey = {};
      topo.objects["blocks"].geometries.forEach((geometry) => {
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

    const tooltipSignal = computed(() => {
      let signal =
        "{ Municipality: datum.properties.name, title: 'Block Group ' + datum.properties.bg_id, 'Intervention Arm?': datum.properties.intervention_arm ? 'Yes' : 'No' ";
      if (withPredictions.value) {
        signal += ", 'Flag': datum.properties.flag";
      }
      signal += "}";
      return signal;
    });

    // TODO: pick a map
    const spec = computed(() => {
      return {
        $schema: "https://vega.github.io/schema/vega/v5.json",
        background: "transparent",
        signals: [
          {
            name: "tileUrl",
            value:
              "https://api.mapbox.com/styles/v1/ccv-bot/ckr3rr6xu267f19ql084wgkuh/static/",
          },
          {
            name: "mapboxToken",
            value:
              "?access_token=pk.eyJ1IjoiY2N2LWJvdCIsImEiOiJja2psa25za3EyZnQzMnVwOGppMGdsZzJrIn0.D_PRajmte3m3XXebngMMpQ",
          },
          { name: "basePoint", update: "invert('projection',[0,0])" },
          { name: "maxPoint", update: "invert('projection', [width, height])" },
          {
            name: "resolution",
            value: navigator?.connection?.downlink > 1.5 ? "@2x" : "",
          },
          {
            name: "hovered",
            value: null,
            on: [
              { events: "@block_groups:mouseover", update: "datum" },
              { events: "mouseout", update: "null" },
            ],
          },
          {
            name: "clicked",
            value: null,
            on: [
              {
                events: "@block_groups:click",
                update: "clicked === datum ? null : datum",
              },
            ],
          },
          {
            name: "activeGeography",
            update: "clicked || hovered",
          },
        ],
        data: [
          {
            name: "town_outlines",
            values: filteredGeo.value,
            format: { type: "topojson", mesh: "towns" },
          },
          {
            name: "bg_outlines",
            values: filteredGeo.value,
            format: { type: "topojson", feature: "blocks" },
          },
        ],
        projections: [
          {
            name: "projection",
            type: "mercator",
            size: { signal: "[width, height]" },
            fit: { signal: 'data("town_outlines")' },
          },
        ],
        marks: [
          {
            type: "image",
            clip: true,
            encode: {
              update: {
                url: {
                  signal:
                    "tileUrl + '[' + basePoint[0] + ',' +   maxPoint[1] + ',' + maxPoint[0] + ',' + basePoint[1] + ']/' + width + 'x' + height + resolution + mapboxToken",
                },
                width: { signal: "width" },
                height: { signal: "height" },
              },
            },
          },
          {
            type: "shape",
            name: "block_groups",
            from: { data: "bg_outlines" },
            encode: {
              enter: {
                cursor: { value: "pointer" },
                strokeWidth: { value: 1 },
                fill: [
                  { test: "datum.properties.flag === '1'", value: "#2A3465" },
                  {
                    test: `${withPredictions.value} && !datum.properties.intervention_arm`,
                    value: "url(#diagonalHatch)",
                  },
                  { value: "white" },
                ],
              },
              update: {
                stroke: [
                  { test: "datum === activeGeography", value: "#990000" },
                  { value: "#999999" },
                ],
                fillOpacity: [
                  { test: "datum === activeGeography", value: 0.5 },
                  { value: 0.2 },
                ],
                zindex: [
                  { test: "datum === activeGeography", value: 1 },
                  { value: 0 },
                ],
                tooltip: {
                  signal: tooltipSignal.value,
                },
              },
            },
            transform: [{ type: "geoshape", projection: "projection" }],
          },
          {
            type: "shape",
            from: { data: "town_outlines" },
            encode: {
              enter: {
                strokeWidth: { value: 2 },
                stroke: { value: "#393939" },
                fillOpacity: { value: 0 },
              },
            },
            transform: [{ type: "geoshape", projection: "projection" }],
          },
        ],
      };
    });

    // max width and height set due to mapbox static image limits
    const { view } = useVega({
      spec,
      el,
      minHeight: ref(400),
      maxHeight: ref(1280),
      maxWidth: ref(1280),
      includeActions: ref(false),
    });

    let currentBg = "";
    let currentMuni = "";

    // TODO: the tooltip/stats table isn't as reactive as I'd like - maybe look into debouncing these updates
    watch(view, () => {
      if (view.value) {
        view.value.addSignalListener("activeGeography", (name, value) => {
          if (value) {
            if (value.properties.bg_id !== currentBg) {
              currentBg = value.properties.bg_id;
              emit("new-active-bg", currentBg);
            }

            if (value.properties.name !== currentMuni) {
              currentMuni = value.properties.name;
              emit("new-active-municipality", currentMuni);
            }
          } else {
            if (currentBg) {
              currentBg = "";
              emit("new-active-bg", currentBg);
            }
            if (currentMuni) {
              currentMuni = "";
              emit("new-active-municipality", currentMuni);
            }
          }
        });
      }
    });

    return {
      el,
    };
  },
};
</script>
