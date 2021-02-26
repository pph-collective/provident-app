<template>
  <div
    class="hero is-fullheight is-justify-content-center sticky-item"
    :data-aos="animation"
    v-bind="$attrs"
  >
    <slot></slot>
  </div>
</template>

<script>
//  data-aos-anchor-placement="center-center"
export default {
  props: {
    animation: {
      type: String,
      required: false,
      default: "fade"
    }
  }
};
</script>

<style>
.sticky-item {
  position: -webkit-sticky;
  position: sticky;
  top: 0;
}
</style>
