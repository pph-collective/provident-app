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
    },
    level: {
      type: String,
      required: false,
      default: "blocks"
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
            name: "outlines",
            values: this.geo,
            format: { type: "topojson", mesh: this.level }
          }
        ],
        projections: [
          {
            name: "projection",
            type: "mercator",
            size: { signal: "[width, height]" },
            fit: { signal: 'data("outlines")' }
          }
        ],
        marks: [
          {
            type: "shape",
            from: { data: "outlines" },
            encode: {
              enter: {
                strokeWidth: { value: 1 },
                stroke: { value: "#d3d3d3" },
                fill: { value: "transparent" }
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
