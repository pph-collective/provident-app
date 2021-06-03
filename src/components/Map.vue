<template>
  <VegaBase :spec="spec" :has-data="hasData" v-bind="$attrs" />
</template>

<script>
import VegaBase from "@/components/VegaBase";

export default {
  name: "Map",
  components: {
    VegaBase
  },
  props: {
    dataset: {
      type: Array,
      required: true
    },
    height: {
      type: Number,
      default: 720
    },
    geo: {
      type: Object,
      required: true
    }
  },
  computed: {
    hasData() {
      return Object.keys(this.geo).length > 0;
    },
    spec() {
      return {
        $schema: "https://vega.github.io/schema/vega/v5.json",
        height: this.height,
        background: "transparent",
        data: [
          {
            name: "town_outlines",
            values: this.geo,
            format: { type: "topojson", mesh: "towns" }
          },
          {
            name: "bg_outlines",
            values: this.geo,
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
    }
  }
};
</script>
