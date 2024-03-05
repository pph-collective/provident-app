<template>
  <div class="only-printed">
    <h2 class="title is-2">{{ formTitle }}</h2>
    <h3 v-if="blockGroup && municipality" class="subtitle is-3">
      <b>Neighborhood ID:</b> {{ blockGroup }} <br />
      <b>Municipality:</b> {{ municipality }}
    </h3>
    <div class="is-flex is-justify-content-center is-align-items-center">
      <BGMap
        v-if="blockGroup"
        :block-group="blockGroup"
        :min-height="500"
        :min-width="750"
        :dataset="dataset.cbg"
      />
    </div>
    <div class="columns is-multiline my-4">
      <div
        v-for="landmark in landmarks"
        :key="landmark.street_address"
        class="column is-one-third my-1"
      >
        {{ landmark.location_name }}<br />
        {{ landmark.street_address }}<br />
        {{ landmark.city }}, RI {{ landmark.postal_code }} <br />
      </div>
    </div>
    <div v-if="blockGroup" class="page-break" />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useProvidentStore } from "../../store";
import BGMap from "@/components/dashboard/BGMap.vue";

const props = defineProps({
  formTitle: {
    type: String,
    required: true,
  },
  blockGroup: {
    type: String,
    default: "",
  },
  municipality: {
    type: String,
    default: "",
  },
});

const store = useProvidentStore();

const dataset = computed(() => {
  if (store.dataset.cbg.length === 0) {
    store.fetchModelData();
  }

  return store.dataset;
});

const landmarks = computed(() => {
  if (dataset.value !== undefined && props.blockGroup) {
    return dataset.value.cbg.find((c) => c.bg_id === props.blockGroup)
      ?.landmarks;
  }

  return [];
});
</script>
