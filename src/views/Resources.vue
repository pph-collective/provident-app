<template>
  <div class="dashboard container is-fullhd">
    <Card id="TODO-0" style="align-self: start" width="full" :height="5">
      <template #title> TITLE </template>
      <template #subtitle> SUBTITLE </template>
      <template #content> CONTENT </template>
    </Card>

    <Card id="TODO-1" style="align-self: start" width="two-thirds" :height="5">
      <template #title> TITLE </template>
      <template #subtitle> SUBTITLE </template>
      <template #content> CONTENT </template>
    </Card>

    <Card id="TODO-2" width="one-third" :height="5">
      <template #title> TITLE 2 </template>
      <template #subtitle> SUBTITLE </template>
      <template #content> CONTENT </template>
    </Card>

    <Card id="TODO-3" width="one-third" :height="2" :no-header="true">
      <!-- This one has no-header set to true in the line above -->
      <template #content> CONTENT </template>
    </Card>

    <Card id="TODO-4" width="one-third" :height="2" :no-header="true">
      <!-- This one has no-header set to true in the line above -->
      <template #content> CONTENT </template>
    </Card>

    <Card id="TODO-5" width="one-third" :height="2" :no-header="true">
      <!-- This one has no-header set to true in the line above -->
      <template #content> CONTENT </template>
    </Card>
  </div>
</template>

<script setup>
import Card from "@/components/dashboard/Card.vue";
</script>

<style lang="scss" scoped>
@import "@/assets/styles/main.scss";
</style>
