<template>
  <section class="hero is-fullheight" id="bites">
    <div class="hero-head is-hidden-touch">
      <div class="container has-text-centered">
        <router-link to="/"
          ><i class="fas fa-2x my-5 fa-chevron-circle-up"
        /></router-link>
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
            @click="activeBiteId = bite.id"
            class="is-clickable"
          />
        </nav>
        <div
          class="is-flex is-flex-direction-row is-align-items-center is-flex-grow-5"
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
  </section>
</template>

<script>
import { ref } from "vue";

import BiteHeader from "@/components/BiteHeader.vue";
import BiteBody from "@/components/BiteBody.vue";

export default {
  name: "Bites",
  components: {
    BiteHeader,
    BiteBody
  },
  props: {
    biteData: Array
  },
  computed: {
    activeBite() {
      return this.biteData.find(el => el.id === this.activeBiteId);
    }
  },
  setup() {
    const activeBiteId = ref(0);

    return {
      activeBiteId
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
    }
  }
};
</script>
