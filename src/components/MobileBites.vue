<template>
  <div class="container is-flex is-flex-direction-column">
    <div v-for="bite in biteData" :key="bite.id" class="hero">
      <BiteHeader v-bind="bite" :is-active="true" />
      <div class="content is-flex-grow-4 m-3" v-html="bite.description"></div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";

import BiteHeader from "@/components/BiteHeader.vue";

export default {
  name: "Bites",
  components: {
    BiteHeader,
  },
  props: {
    biteData: Array,
  },
  computed: {
    activeBite() {
      return this.biteData.find((el) => el.id === this.activeBiteId);
    },
  },
  setup() {
    const activeBiteId = ref(0);

    return {
      activeBiteId,
    };
  },
  methods: {
    incrementBiteId() {
      // have the active id cycle around if it hits either end
      if (this.activeBiteId + 1 >= this.biteData.length) {
        this.activeBiteId = 0;
      } else {
        this.activeBiteId += 1;
      }
    },
    decrementBiteId() {
      // have the active id cycle around if it hits either end
      if (this.activeBiteId - 1 < 0) {
        this.activeBiteId = this.biteData.length - 1;
      } else {
        this.activeBiteId -= 1;
      }
    },
  },
};
</script>
