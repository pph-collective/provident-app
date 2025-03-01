<template>
  <tbody class="is-size-6-7">
    <tr class="header-row">
      <th colspan="4" class="has-text-centered has-text-light">
        {{ title }}
      </th>
    </tr>
    <template v-for="(metrics, group) in groupedMetrics" :key="group">
      <!-- group level row -->
      <tr
        v-if="grouped"
        class="is-clickable"
        @click="showGroups[group] = !showGroups[group]"
      >
        <th>
          <div
            class="has-text-right px-1 is-flex is-justify-content-space-between is-align-items-center"
          >
            <span class="icon">
              <i
                class="fas"
                :class="[
                  showGroups[group] ? 'fa-caret-down' : 'fa-caret-right',
                ]"
              />
            </span>
            <span>
              {{ group }}
            </span>
          </div>
        </th>
        <td class="data-column has-text-center">
          <StatsTableIcon
            :metric="group"
            :stats="stats.geoid"
            :number="false"
            :location="geoid"
          />
        </td>
        <td class="data-column has-text-center" />
        <td class="data-column has-text-center" />
      </tr>

      <!-- group detail rows -->
      <template v-if="showGroups[group]">
        <tr v-for="metric in metrics" :key="metric">
          <th>
            <div
              class="has-text-right has-text-weight-medium is-flex is-justify-content-end is-align-items-center"
            >
              <div class="is-flex-grow-1">
                {{ metric.title }}
              </div>
              <div class="tooltip has-text-info">
                <i class="fas fa-xs fa-info-circle" />
                <span class="tooltiptext">{{ metric.info }}</span>
              </div>
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

<script setup>
import { reactive } from "vue";
import StatsTableIcon from "@/components/dashboard/StatsTableIcon.vue";

const props = defineProps({
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
});

// Start all of the groups showing true
const showGroups = reactive(
  Object.keys(props.groupedMetrics).reduce((acc, group) => {
    acc[group] = true;
    return acc;
  }, {}),
);
</script>

<style lang="scss" scoped>
@import "@/assets/styles/main.scss";
.table {
  th,
  td {
    vertical-align: middle;
    padding-top: 0.32em;
    padding-bottom: 0.32em;
    line-height: 1.2;
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
  width: max(180px, 20vw);
  bottom: 100%;
  left: 50%;
  margin-left: calc(-1 * max(180px, 20vw) / 2);
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
