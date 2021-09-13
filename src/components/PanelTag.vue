<template>
  <span class="level-item tag is-light"
    ><p>
      <strong>{{ label.toUpperCase() }}{{ value && ":" }}</strong> {{ value }}
    </p></span
  >
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
      required: false,
      default: "",
    },
  },
};
</script>
