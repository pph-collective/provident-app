<template>
  <div class="container">
    <div class="scroll-block-1">
      <div class="field has-addons py-4 is-justify-content-center">
        <p v-for="state in states" :key="state" class="control">
          <button
            :class="[
              'button',
              'is-info',
              activeState.code !== state.code ? 'is-outlined' : ''
            ]"
            @click="updateActiveState(state)"
            :active="activeState.code == state.code"
          >
            <span>{{ state.name }}</span>
          </button>
        </p>
      </div>

      <StickyItem>
        <Map :dataset="[]" :geo="geo" :include-actions="true" :level="level" />
      </StickyItem>

      <ScrollItem>
        <div class="has-text-centered is-size-1">
          {{ activeState.name }}
        </div>
      </ScrollItem>
      <ScrollItem>
        <div class="has-text-centered is-size-1">
          ... is {{ activeState.word }}
        </div>
      </ScrollItem>
    </div>

    <div class="scroll-block-2">
      <StickyItem class="right-side">
        <img
          src="https://bulma.io/images/bulma-logo.png"
          width="400"
          height="200"
        />
      </StickyItem>

      <ScrollItem class="left-side has-text-centered">
        words
      </ScrollItem>

      <ScrollItem class="left-side has-text-centered">
        more words
      </ScrollItem>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from "vue";

import Map from "@/components/Map";
import ScrollItem from "@/components/ScrollItem";
import StickyItem from "@/components/StickyItem";

export default {
  components: {
    Map,
    ScrollItem,
    StickyItem
  },
  setup() {
    const states = [
      { code: "ri", name: "Rhode Island", word: "Coffee Milk" },
      { code: "ma", name: "Massachusetts", word: "Wicked" },
      { code: "ny", name: "New York City", word: "My Way" }
    ];
    const activeState = ref(states[0]);
    const level = "blocks";
    const geo = ref({});

    const updateGeoData = async () => {
      let mod = await import(`@/assets/geojson/${activeState.value.code}.json`);
      geo.value = mod.default;
    };

    onMounted(updateGeoData);
    watch(activeState, updateGeoData);

    const updateActiveState = state => {
      activeState.value = state;
    };

    return {
      states,
      activeState,
      level,
      geo,
      updateActiveState
    };
  }
};
</script>
