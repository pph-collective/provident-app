<template>
  <div ref="el"></div>
</template>

<script>
import { ref, toRefs, computed } from "vue";

import * as topology from "topojson-server";

import { useVega } from "@/composables/useVega.js";
import geo from "@/assets/geojson/ri.json";

export default {
  props: {
    blockGroup: {
      type: String,
      required: true,
    },
    landmarks: {
      type: Array,
      default: () => [],
    },
  },
  setup(props) {
    const { blockGroup, landmarks } = toRefs(props);
    const el = ref(null);

    // filter geo data and simplify
    const filteredGeo = computed(() => {
      let filtered = geo.filter((g) => blockGroup.value === g.properties.bg_id);

      const collection = {
        blocks: { type: "FeatureCollection", features: filtered },
      };

      let topo = topology.topology(collection, 1e9);

      return topo;
    });

    const spec = computed(() => {
      return {
        $schema: "https://vega.github.io/schema/vega/v5.json",
        background: "white",
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
        ],
        data: [
          {
            name: "bg_outlines",
            values: filteredGeo.value,
            format: { type: "topojson", feature: "blocks" },
          },
          {
            name: "landmarks",
            values: landmarks.value,
            transform: [
              {
                type: "geopoint",
                projection: "projection",
                fields: ["longitude", "latitude"],
              },
            ],
          },
        ],
        projections: [
          {
            name: "projection",
            type: "mercator",
            size: { signal: "[width, height]" },
            fit: { signal: 'data("bg_outlines")' },
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
                strokeWidth: { value: 6 },
                strokeOpacity: { value: 0.6 },
              },
            },
            transform: [{ type: "geoshape", projection: "projection" }],
          },
          {
            type: "symbol",
            from: { data: "landmarks" },
            encode: {
              enter: {
                size: { value: 50 },
                x: { field: "x" },
                y: { field: "y" },
              },
            },
          },
        ],
      };
    });

    // max width and height set due to mapbox static image limits
    useVega({
      spec,
      el,
      minHeight: ref(400),
      maxHeight: ref(1280),
      maxWidth: ref(1280),
      includeActions: ref(true),
    });

    return {
      el,
    };
  },
};
</script>
