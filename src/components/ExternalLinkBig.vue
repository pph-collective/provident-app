<template>
  <a :href="href" target="_blank" rel="noopener noreferrer">
    <div class="card">
      <div class="card-content">
        <div class="media">
          <div class="media-content">
            <p class="title is-4">{{ title }}</p>
            <p class="subtitle is-6">{{ subtitle }}</p>
          </div>
          <div class="media-right">
            <span class="icon is-large">
              <span class="fa-stack fa-lg">
                <i class="fas fa-external-link-alt"></i>
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </a>
</template>

<script>
export default {
  props: {
    href: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: "",
    },
    subtitle: {
      type: String,
      default: "",
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/main.scss";
</style>
