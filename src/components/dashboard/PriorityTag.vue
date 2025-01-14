<template>
  <div
    class="priority-tag notification is-size-6-7 p-1 has-text-centered my-3"
    :style="{ '--color': priorityToColor[priority] ?? '#DBD4D0' }"
  >
    <p v-if="priority">
      <span class="has-text-weight-bold">{{ priority }}</span>
    </p>
    <p v-else>No block group selected</p>
  </div>
</template>

<script setup>
import { priorityToColor } from "@/utils/utils.js";

defineProps({
  priority: {
    type: String,
    required: true,
  },
});
</script>

<style lang="scss" scoped>
.priority-tag {
  --color: lightgrey;
  border: solid 1px var(--color);
  background-color: var(--color);
  background-image: linear-gradient(
    hsla(255, 100%, 100%, 0.8) 100%,
    transparent 100%
  );
}
</style>
