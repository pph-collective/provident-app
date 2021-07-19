<template>
  <div
    class="is-flex is-flex-direction-row is-flex-grow-5 is-align-items-center"
  >
    <div class="column is-two-thirds content" v-html="description"></div>
    <div class="column has-text-centered">
      <i :class="['fas', 'fa-10x', `fa-${icon}`, 'p-2']" />
    </div>
  </div>
</template>

<script>
export default {
  name: "BiteHeader",
  props: {
    title: String,
    icon: String,
    description: String,
    isActive: Boolean,
  },
};
</script>

<style></style>
