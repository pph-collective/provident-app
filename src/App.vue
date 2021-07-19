<template>
  <NavBar />
  <router-view />
  <Footer />
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

<style lang="scss"></style>
