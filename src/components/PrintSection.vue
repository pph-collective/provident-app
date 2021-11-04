<template>
  <slot></slot>
  <teleport v-if="printable" to="body">
    <div class="printable">
      <slot></slot>
    </div>
  </teleport>
</template>

<script>
export default {
  props: {
    printable: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
