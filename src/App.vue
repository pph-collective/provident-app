<template>
  <NavBar />
  <div id="content-container">
    <router-view />
  </div>
  <BaseFooter />

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

<script setup>
import NavBar from "@/components/NavBar.vue";
import BaseFooter from "@/components/BaseFooter.vue";
</script>

<style lang="scss">
.svg-container {
  height: 0px;
}

#content-container {
  min-height: 90vh;
  position: relative;
}
</style>
