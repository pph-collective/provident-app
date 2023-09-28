<template>
  <div class="tags has-addons my-1 mr-1">
    <span class="tag is-dark px-1 is-size-6-7 has-text-weight-semibold mb-0">{{
      label
    }}</span>
    <span
      class="tag is-light px-1 is-size-6-7 is-family-monospace mb-0 is-flex-grow-1"
      :style="{ 'min-width': minWidth }"
    >
      <span class="icon-text is-light is-flex is-align-items-center"
        ><span>{{ value || "-" }}</span>
        <span v-if="link" class="icon is-small mb-1"
          ><a class="icon-link" :href="link" target="_blank" rel="noreferrer"
            ><i class="fas fa-xs fa-external-link-alt" /></a></span></span
    ></span>
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: false,
    default: "",
  },
  minWidth: {
    type: String,
    required: true,
  },
});
</script>

<style lang="scss" scoped>
@import "@/assets/styles/main.scss";
.icon-link {
  color: inherit;
  &:hover {
    color: $link;
  }
}
</style>
