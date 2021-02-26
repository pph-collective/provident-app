<template>
  <NavBar />
  <router-view />
  <Footer />
</template>

<script>
import AOS from "aos";

import NavBar from "@/components/NavBar.vue";
import Footer from "@/components/Footer.vue";

export default {
  components: {
    NavBar,
    Footer
  },
  created() {
    AOS.init();
  }
};
</script>

<style lang="scss"></style>
