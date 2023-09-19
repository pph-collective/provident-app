<template>
  <section id="bites" class="hero is-fullheight">
    <div class="hero-head is-hidden-touch">
      <div class="container has-text-centered">
        <router-link to="/">
          <i class="fas fa-2x my-5 fa-chevron-circle-up has-text-primary" />
        </router-link>
      </div>
    </div>

    <div class="hero-body">
      <div
        class="desktop-container container has-background-light p-5 is-flex is-flex-direction-column is-align-items-stretch"
      >
        <nav class="columns">
          <BiteHeader
            v-for="bite in biteData"
            :key="bite.id"
            v-bind="bite"
            :is-active="bite.id === activeBiteId"
            class="is-clickable"
            @click="activeBiteId = bite.id"
          />
        </nav>
        <div
          class="is-flex-grow-5 is-flex-shrink-1"
          style="flex: 1; min-height: 0"
        >
          <div
            class="is-flex is-flex-direction-row is-align-items-center"
            style="height: 100%"
          >
            <div class="is-clickable pr-2" @click="decrementBiteId">
              <i class="fas fa-2x my-5 fa-chevron-left" />
            </div>
            <BiteBody v-bind="activeBite" />
            <div class="is-clickable pl-2" @click="incrementBiteId">
              <i class="fas fa-2x my-5 fa-chevron-right" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from "vue";

import BiteHeader from "@/components/BiteHeader.vue";
import BiteBody from "@/components/BiteBody.vue";

const props = defineProps({
  biteData: {
    type: Array,
    default: () => [],
  },
});

const activeBiteId = ref(0);

const activeBite = computed(() => {
  return props.biteData.find((el) => el.id === activeBiteId.value);
});

const incrementBiteId = () => {
  // have the active id cycle around if it hits either end
  if (activeBiteId.value + 1 >= props.biteData.length) {
    activeBiteId.value = 0;
  } else {
    activeBiteId.value += 1;
  }
};

const decrementBiteId = () => {
  // have the active id cycle around if it hits either end
  if (activeBiteId.value - 1 < 0) {
    activeBiteId.value = props.biteData.length - 1;
  } else {
    activeBiteId.value -= 1;
  }
};
</script>
