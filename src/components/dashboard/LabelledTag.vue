<template>
  <div class="tags has-addons m-1">
    <span class="tag px-1 is-size-6-7 has-text-weight-semibold mb-0">{{
      label
    }}</span>
    <span
      class="
        tag
        is-primary
        px-1
        is-size-6-7 is-family-monospace
        mb-0
        is-flex-grow-1
      "
      :style="{ 'min-width': minWidth }"
      >{{ value || "-" }}</span
    >
  </div>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    minWidth: {
      type: String,
      required: true,
    },
  },
};
</script>
