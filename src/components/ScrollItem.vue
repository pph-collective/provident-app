<template>
  <div
    class="hero is-fullheight is-justify-content-center"
    :data-aos="animation"
    v-bind="$attrs"
  >
    <slot></slot>
  </div>
</template>

<script>
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
