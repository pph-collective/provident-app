<template>
  <div ref="el" />
</template>

<script setup>
import { ref, computed, watch } from "vue";

import * as topology from "topojson-server";
import * as tc from "topojson-client";
import * as ts from "topojson-simplify";
const topojson = { ...ts, ...tc };

import { useVega } from "@/composables/useVega.js";
import geo from "@/assets/geojson/ri.json";
import zipcodesGeo from "@/assets/geojson/ri_zipcodes.json";

import { sortByProperty } from "@/utils/utils.js";
import { useStore } from "vuex";

const props = defineProps({
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
  viewForms: {
    type: Boolean,
    required: true,
  },
  zipcode: {
    type: Object,
    required: true,
  },
  activeBlockGroup: {
    type: String,
    require: true,
    default: () => "",
  },
});

const emit = defineEmits(["new-active-bg", "active-clicked-status"]);

const el = ref(null);
const store = useStore();

const formResponses = store.state.user.formResponses;
const geoIdToFormResponses = {};

formResponses
  .filter(
    (f) =>
      [
        "Neighborhood Rapid Assessment",
        "Six Month Resource Plan",
        "Mid-way Followup to the Six Month Resource Plan",
        "Followup to Six Month Resource Plan",
      ].includes(f.form.title) && f.response.bg_id !== undefined,
  )
  .forEach((formResponse) => {
    const geoid = formResponse.response.bg_id;

    if (geoIdToFormResponses[geoid]) {
      geoIdToFormResponses[geoid].push(formResponse);
    } else {
      geoIdToFormResponses[geoid] = [formResponse];
    }
  });

const filteredZip = computed(() => {
  if (props.zipcode.name === "All Zip Codes") {
    // Doesn't matter since we're zooming to the municipalities instead if the dropdown is 'All Zip Codes'
    return [];
  } else {
    return zipcodesGeo.find(
      (z) => props.zipcode.zip === z.properties.ZCTA5CE10,
    );
  }
});

// filter geo data and simplify
const filteredGeo = computed(() => {
  let filtered = geo;
  if (props.filterMunicipalities.length > 0) {
    filtered = geo.filter((g) =>
      props.filterMunicipalities.includes(g.properties.name),
    );
  }

  filtered.forEach((g) => {
    const datum = props.dataset.find((d) => d.geoid === g.id) ?? {};
    g.properties.flag = datum[props.flagProperty] ?? "-1";
    g.properties.intervention_arm = datum.intervention_arm ?? false;
    g.properties.landmarks = datum.landmarks
      ? `${datum.landmarks
          .sort(sortByProperty("rank"))
          .map((x) => `${x.rank}. ${x.location_name} `)
          .join("\n")}`
      : [];
    g.properties.tooltip = datum.tooltip ?? {};
    g.properties.forms = geoIdToFormResponses[g.id.slice(-7)] ?? [];
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
      topojson.sphericalRingArea,
    ),
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
  let signal = `{
      Municipality: datum.properties.name,
      title: 'Block Group ' + datum.properties.bg_id`;
  if (props.withPredictions) {
    signal += `, 'Prediction Eligible?': datum.properties.intervention_arm ? 'Yes' : 'No',
    'Prediction': datum.properties.flag === '1' ? 'Prioritized' : datum.properties.flag === '0' ? 'Not Prioritized' : 'N/A'`;
    signal +=
      ", 'Priority': datum.properties.intervention_arm ? datum.properties.tooltip.priority : 'N/A'";
  }
  signal +=
    ", 'Points of Interest': (datum.properties.landmarks && datum.properties.landmarks.length > 0) ? datum.properties.landmarks : ''";
  signal += "}";
  return signal;
});

const blockGroupFill = computed(() => {
  const fill = [];

  if (props.viewForms) {
    // View Forms
    fill.push({
      test: "datum.properties.forms.length > 0",
      value: "#2A3465",
    });
  } else {
    // Default Dashboard Fill
    fill.push({ test: "datum.properties.flag === '1'", value: "#2A3465" });
    fill.push({
      test: `${props.withPredictions} && !datum.properties.intervention_arm`,
      value: "url(#diagonalHatch)",
    });
  }

  // Defaults
  fill.push({ value: "white" });

  return fill;
});

const spec = computed(() => {
  return {
    $schema: "https://vega.github.io/schema/vega/v5.json",
    background: "transparent",
    autosize: "none",
    signals: [
      {
        name: "tileUrl",
        value:
          "https://api.mapbox.com/styles/v1/ccv-bot/cl5wvienz000o16qk2qw5n52h/static/",
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
            events: "@block_groups:mousedown",
            update: "clicked === datum ? null : datum",
          },
          {
            events: "@block_groups:touchend",
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
      {
        name: "zipcode_outlines",
        values: filteredZip.value,
      },
    ],
    projections: [
      {
        name: "projection",
        type: "mercator",
        size: { signal: "[width, height]" },
        fit: {
          signal:
            props.zipcode.name === "All Zip Codes"
              ? 'data("town_outlines")'
              : 'data("zipcode_outlines")',
        },
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
            fill: blockGroupFill.value,
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

// TODO: the tooltip/stats table isn't as reactive as I'd like - maybe look into debouncing these updates
watch(view, () => {
  if (view.value) {
    view.value.addSignalListener("activeGeography", (name, value) => {
      if (value) {
        if (value.properties.bg_id !== props.activeBlockGroup) {
          emit("new-active-bg", value.properties.bg_id);
        }
      } else {
        if (props.activeBlockGroup) {
          emit("new-active-bg", "");
        }
      }
    });

    view.value.addSignalListener("clicked", (name, value) => {
      const clicked = value !== null;
      emit("active-clicked-status", clicked);
    });
  }
});
</script>
