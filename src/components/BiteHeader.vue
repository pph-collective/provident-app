<template>
  <div class="column">
    <div
      :class="[
        'box',
        'is-flex',
        'is-flex-direction-row',
        'is-flex-wrap-nowrap',
        'is-align-items-center',
        'bite-column',
        isActive ? 'has-background-primary' : 'has-background-primary-light',
        isActive ? 'has-text-primary-light' : 'has-text-primary',
      ]"
    >
      <i :class="['fas', 'fa-2x', `fa-${icon}`, 'p-2']" />
      <h3 class="is-size-3">
        {{ title }}
      </h3>
    </div>
  </div>
</template>

<script setup>
defineProps({
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
});
</script>

<style>
.bite-column {
  height: 100%;
}
</style>
