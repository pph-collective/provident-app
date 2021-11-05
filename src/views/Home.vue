<template>
  <div class="home">
    <section
      class="hero is-fullheight-with-navbar is-primary header-image"
      id="top"
    >
      <div
        class="
          hero-body
          is-flex-direction-column
          is-justify-content-center
          is-align-items-flex-end
        "
      >
        <h1 class="title mb-6" :class="[isMobile ? 'is-size-3' : 'is-size-1']">
          Our current methods for ending the overdose crisis are limited by
          tools that respond after overdose events occur.
        </h1>
        <h2
          class="subtitle mt-4"
          :class="[isMobile ? 'is-size-4' : 'is-size-2']"
        >
          What if we could prevent overdose events before they occur?
        </h2>
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
    MobileBites,
  },
  setup() {
    const biteData = reactive([
      reactive({
        id: 0,
        title: "How will we do this?",
        description:
          "<h1>The PROVIDENT Study is a research study looking to prevent drug-related deaths in neighborhoods across Rhode Island.</h1><p>We will test a new set of tools for public health and policy leaders to help them predict, or forecast, the future overdose trends and patterns in their state - and identify the best ways to intervene and save lives. Our results will improve public health decision-making and inform resource allocation to communities that should be prioritized for evidence-based prevention, treatment, recovery, and overdose rescue services. If found to be effective, The PROVIDENT Model forecasting tool will be disseminated to other states, which could adapt the tool to guide resource allocation and maximize public health impact.</p>",
        icon: "layer-group ",
      }),
      reactive({
        id: 1,
        title: "Study Design",
        description:
          "<h1>This study is a randomized control trial, a type of trial that helps researchers and government agencies see whether new interventions are an improvement over existing ones.</h1><p>In the PROVIDENT study, we are comparing a new tool to guide how we deliver harm reduction services in Rhode Island. In some cities and towns, we will continue to deliver the standard of care using detailed neighborhood-level maps along with neighborhood assessment and planning forms to make decisions using data on overdose. In other cities and towns, we aim to use an additional tool called the PROVIDENT model that makes predictions about which neighborhoods are at the highest risk for future overdoses. It is important to note that there will be no changes to the overall amount of resources dedicated to preventing overdose deaths in Rhode Island. Regardless of where an organization is located, they will receive support and training from our team at the People, Place, and Health Collective on how to use data to make decisions. If the trial is successful, our goal is to reduce overdose rates by 40% over 2 years.</p>",
        icon: "ruler-combined",
      }),
    ]);

    const { isMobile } = useMobileListener();

    return {
      biteData,
      isMobile,
    };
  },
};
</script>

<style lang="scss" scoped>
.header-image {
  background-image: url("../assets/images/pawel-czerwinski-kmviGX74hXU-unsplash.jpg");
  background-position: center center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
  background-color: #999;
}
</style>
