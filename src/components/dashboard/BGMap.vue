<template>
  <div ref="el"></div>
</template>

<script>
import { ref, toRefs, computed, watch } from "vue";
import { useStore } from "vuex";

import * as topology from "topojson-server";

import { useVega } from "@/composables/useVega.js";
import geo from "@/assets/geojson/ri.json";

import { poriRed } from "@/utils/utils";

export default {
  props: {
    blockGroup: {
      type: String,
      required: true,
    },
    dataset: {
      type: Array,
      default: () => [],
    },
    minHeight: {
      type: Number,
      default: 400,
    },
    maxHeight: {
      type: Number,
      default: 1280,
    },
  },
  setup(props) {
    const { blockGroup, dataset, minHeight, maxHeight } = toRefs(props);
    const el = ref(null);
    const store = useStore();

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
      const data = dataset.value.find((d) => d.bg_id === blockGroup.value);

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
              "?access_token=pk.eyJ1IjoiY2N2LWJvdCIsImEiOiJja3ZsY2JzMHY2ZGRiMm9xMTQ0eW1nZTJsIn0.uydOaXlX1uQfxPrKfucB2A",
          },
          { name: "basePoint", update: "invert('projection',[0,0])" },
          { name: "maxPoint", update: "invert('projection', [width, height])" },
          {
            name: "resolution",
            value: navigator?.connection?.downlink > 1.5 ? "@2x" : "",
          },
          {
            name: "clicked",
            value: null,
            on: [
              {
                events: "@landmark_symbols:click",
                update: "datum",
              },
            ],
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
            values: data?.landmarks ?? [],
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
            name: "landmark_symbols",
            from: { data: "landmarks" },
            encode: {
              enter: {
                size: { value: 300 },
                x: { field: "x" },
                y: { field: "y" },
                fill: { value: poriRed },
                fillOpacity: { value: 0.5 },
                stroke: { value: poriRed },
                strokeWidth: { value: 1.5 },
                cursor: { value: "pointer" },
              },
              update: {
                tooltip: {
                  signal: `{'title': datum.location_name,
                    'Address': datum.street_address + ', ' + datum.city + ', RI ' + datum.postal_code,
                    'Category': datum.top_category,
                    'Rank': datum.rank}`,
                },
              },
            },
          },
        ],
      };
    });

    // max width and height set due to mapbox static image limits
    const { view } = useVega({
      spec,
      el,
      minHeight,
      maxHeight,
      maxWidth: ref(1280),
      includeActions: ref(false),
    });

    const composeAddress = (datum) => {
      return (
        datum.street_address + ", " + datum.city + ", RI " + datum.postal_code
      );
    };

    watch(view, () => {
      if (view.value) {
        view.value.addSignalListener("clicked", (name, value) => {
          if (value) {
            navigator.clipboard
              .writeText(composeAddress(value))
              .then(() => {
                store.dispatch("addNotification", {
                  message: `Address copied to clipboard: ${value.location_name}`,
                });
              })
              .catch((err) => console.log(err));
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
