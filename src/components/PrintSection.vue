<template>
  <slot />
  <teleport v-if="printable" to="body">
    <div class="printable">
      <slot />
    </div>
  </teleport>
</template>

<script setup>
defineProps({
  printable: {
    type: Boolean,
    default: false,
  },
});
</script>
