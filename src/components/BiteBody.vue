<template>
  <div
    class="is-flex is-flex-direction-row is-flex-grow-5 is-align-items-center has-text-dark is-align-self-start"
    style="height: 100%"
  >
    <div
      class="column is-two-thirds content scroll-container is-align-self-start"
    >
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-html="description" />
    </div>
    <div class="column has-text-centered">
      <i :class="['fas', 'fa-10x', `fa-${icon}`, 'p-2']" />
    </div>
  </div>
</template>

<script>
export default {
  name: "BiteHeader",
  props: {
    title: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    isActive: Boolean,
  },
};
</script>

<style lang="scss" scoped>
.scroll-container {
  max-height: 100%;
  overflow-y: auto;
}

.is-align-self-start {
  align-self: start;
}
</style>
