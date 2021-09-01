<template>
  <NavBar />
  <router-view />
  <Footer />

  <!-- diagonal hash pattern for map -->
  <div class="svg-container">
    <svg height="0" width="0">
      <defs>
        <pattern
          id="diagonalHatch"
          patternUnits="userSpaceOnUse"
          width="8"
          height="8"
          patternTransform="rotate(-45 4 4)"
        >
          <path d="M -1,2 l 10,0" stroke="#bbbbbb" stroke-width="3" />
        </pattern>
      </defs>
    </svg>
  </div>
</template>

<script>
import { onMounted } from "vue";
import { useStore } from "vuex";

import NavBar from "@/components/NavBar.vue";
import Footer from "@/components/Footer.vue";

export default {
  components: {
    NavBar,
    Footer,
  },
  setup() {
    const store = useStore();
    onMounted(async () => {
      await store.dispatch("fetchOrgs");
    });
  },
};
</script>

<style lang="scss">
.svg-container {
  height: 0px;
}
</style>
