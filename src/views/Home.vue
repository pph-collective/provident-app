<template>
  <div class="home">
    <section class="hero is-fullheight-with-navbar is-primary" id="top">
      <div class="hero-body">
        <h1 class="title">
          PRO[FOUND|VIDENT]
        </h1>
        <h2 class="subtitle">A model with <i class="fas fa-heart" /></h2>
      </div>
      <div class="hero-foot is-hidden-touch">
        <div class="container has-text-centered">
          <router-link to="#bites"
            ><i class="fas fa-2x my-5 fa-chevron-circle-down"
          /></router-link>
        </div>
      </div>
    </section>

    <Bites v-if="!isMobile" :bite-data="biteData" />
    <MobileBites v-else :bite-data="biteData" />
  </div>
</template>

<script>
import { reactive } from "vue";

import Bites from "@/components/Bites.vue";
import MobileBites from "@/components/MobileBites.vue";

import { useMobileListener } from "@/composables/useMobileListener";

export default {
  name: "Home",
  components: {
    Bites,
    MobileBites
  },
  setup() {
    const biteData = reactive([
      reactive({
        id: 0,
        title: "A First Bite",
        description:
          "<h1>The first bite is always the best bite.</h1><p>...or is it?</p>",
        icon: "cookie"
      }),
      reactive({
        id: 1,
        title: "A Second Bite",
        description:
          "<h2>The second bite is when you really taste the cookie.</h2><p>hee hee hee</p>",
        icon: "cookie-bite"
      }),
      reactive({
        id: 2,
        title: "A Different Choice",
        description:
          "<h2>Waffles are cookies too.</h2><p>#neverforgetwaffles</p>",
        icon: "stroopwafel"
      })
    ]);

    const { isMobile } = useMobileListener();

    return {
      biteData,
      isMobile
    };
  }
};
</script>
