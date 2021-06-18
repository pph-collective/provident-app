<template>
  <div class="buttons is-flex is-justify-content-center full-height">
    <button
      v-for="page in pages"
      :key="'nav-' + page.route"
      class="button is-primary tall-button py-4 mx-4"
      type="button"
      @click="$router.push(`/snack/${page.route}`)"
    >
      <div class="is-flex is-flex-direction-column">
        <i :class="['fas', page.icon, 'is-size-1']" />
        <h2 class="is-size-3">{{ page.name }}</h2>
      </div>
    </button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // TODO - make this non-repetitive with Sidbar - store maybe?
      pages: [
        {
          name: "Dashboard",
          route: "dashboard",
          icon: "fa-chart-line"
        },
        {
          name: "Forms",
          route: "forms",
          icon: "fa-file-alt"
        }
      ]
    };
  }
};
</script>

<style lang="scss" scoped>
.tall-button {
  height: auto;
  width: 25%;
}

.full-height {
  height: 80vh;
}
</style>
