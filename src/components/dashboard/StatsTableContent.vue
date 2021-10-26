<template>
  <tbody class="is-size-6-7">
    <tr class="header-row">
      <th colspan="4" class="has-text-centered has-text-light">{{ title }}</th>
    </tr>
    <template v-for="(metrics, group) in groupedMetrics" :key="group">
      <!-- group level row -->
      <tr
        v-if="grouped"
        @click="showGroups[group] = !showGroups[group]"
        class="is-clickable"
      >
        <th
          class="
            has-text-right has-text-bold
            px-1
            is-flex is-justify-content-space-between is-align-items-center
          "
        >
          <span class="icon">
            <i
              class="fas"
              :class="[showGroups[group] ? 'fa-caret-down' : 'fa-caret-right']"
            />
          </span>
          <span>
            {{ group }}
          </span>
        </th>
        <td class="data-column has-text-center">
          <StatsTableIcon
            :metric="group"
            :stats="stats.geoid"
            :number="false"
            :location="geoid"
          />
        </td>
        <td class="data-column has-text-center">
          <StatsTableIcon
            :metric="group"
            :stats="stats.municipality"
            :number="false"
            :location="municipality"
          />
        </td>
        <td class="data-column has-text-center">
          <StatsTableIcon
            :metric="group"
            :stats="stats.ri"
            :number="false"
            location="RI"
          />
        </td>
      </tr>

      <!-- group detail rows -->
      <template v-if="showGroups[group]">
        <tr v-for="metric in metrics" :key="metric">
          <th
            class="
              has-text-right has-text-weight-medium
              is-flex is-justify-content-end is-align-items-center
            "
          >
            <div class="is-flex-grow-1">
              {{ metric.title }}
            </div>
            <div class="tooltip has-text-info">
              <i class="fas fa-xs fa-info-circle" />
              <span class="tooltiptext">{{ metric.info }}</span>
            </div>
          </th>
          <td class="data-column has-text-center">
            <StatsTableIcon
              :metric="metric.field"
              :format-fn="metric.formatter"
              :stats="stats.geoid"
              :location="geoid"
              :icon="false"
            />
          </td>
          <td class="data-column has-text-center">
            <StatsTableIcon
              :metric="metric.field"
              :format-fn="metric.formatter"
              :stats="stats.municipality"
              :location="municipality"
              :icon="false"
            />
          </td>
          <td class="data-column has-text-center">
            <StatsTableIcon
              :metric="metric.field"
              :format-fn="metric.formatter"
              :stats="stats.ri"
              location="RI"
              :icon="false"
            />
          </td>
        </tr>
      </template>
    </template>
  </tbody>
</template>

<script>
import { toRefs, reactive } from "vue";

import StatsTableIcon from "@/components/dashboard/StatsTableIcon.vue";

export default {
  components: {
    StatsTableIcon,
  },
  props: {
    stats: {
      type: Object,
      required: true,
    },
    groupedMetrics: {
      type: Object,
      required: true,
    },
    municipality: {
      type: String,
      required: false,
      default: "",
    },
    geoid: {
      type: String,
      required: false,
      default: "",
    },
    grouped: {
      type: Boolean,
      required: false,
      default: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { groupedMetrics, grouped } = toRefs(props);

    const showGroups = reactive({});

    let showGroup = true; // want to show the first group
    for (const group of Object.keys(groupedMetrics.value)) {
      showGroups[group] = showGroup;
      showGroup = grouped.value ? false : true;
    }

    return {
      showGroups,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "bulma";
.table {
  line-height: 1;

  th,
  td {
    vertical-align: middle;
    padding-top: 0.2em;
    padding-bottom: 0.2em;
  }
}

table tbody tr.header-row {
  background-color: $grey-dark;
  color: $light;
}

.data-column {
  min-width: 48px;
  padding-left: 2px !important;
  padding-right: 2px !important;
  text-align: center !important;
}

/* Tooltip container */
.tooltip {
  position: relative;
  display: inline-block;
  width: 1rem;
}

/* Tooltip text */
.tooltip .tooltiptext {
  visibility: hidden;
  width: 180px;
  bottom: 100%;
  left: 50%;
  margin-left: -90px;
  background-color: $grey-dark;
  color: #fff;
  text-align: center;
  padding: 5px 5px;
  border-radius: 3px;

  /* Position the tooltip text - see examples below! */
  position: absolute;
  z-index: 1;
}

/* Show the tooltip text when you mouse over the tooltip container */
.tooltip:hover .tooltiptext {
  visibility: visible;
}
</style>
