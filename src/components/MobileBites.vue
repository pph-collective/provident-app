<template>
  <div class="container is-flex is-flex-direction-column">
    <div v-for="bite in biteData" :key="bite.id" class="hero">
      <BiteHeader v-bind="bite" :is-active="true" />
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div class="content is-flex-grow-4 m-3" v-html="bite.description" />
    </div>
  </div>
</template>

<script setup>
import BiteHeader from "@/components/BiteHeader.vue";

defineProps({
  biteData: {
    type: Array,
    default: () => [],
  },
});
</script>
