<template>
  <a :href="href" target="_blank" rel="noopener noreferrer"
    ><slot></slot> <i v-if="showIcon" class="fas fa-external-link-alt fa-sm"></i
  ></a>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    href: string;
    showIcon?: boolean;
  }>(),
  {
    showIcon: true,
  },
);
</script>
