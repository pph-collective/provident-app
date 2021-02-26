<template>
  <nav class="navbar is-dark" role="navigation" aria-label="main navigation">
    <div class="container">
      <div class="navbar-brand">
        <router-link to="/" class="navbar-item">
          <img
            src="https://bulma.io/images/bulma-logo.png"
            width="112"
            height="28"
          />
        </router-link>

        <a
          role="button"
          :class="['navbar-burger', { 'is-active': hamburgerActive }]"
          aria-label="menu"
          aria-expanded="false"
          data-target="navbar-contents"
          @click="toggleBurgerMenu"
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div
        id="navbar-contents"
        :class="['navbar-menu', { 'is-active': hamburgerActive }]"
      >
        <div class="navbar-start">
          <router-link to="/" class="navbar-item">Home</router-link>

          <router-link to="/snack" class="navbar-item">Snack</router-link>

          <router-link to="/about" class="navbar-item">About</router-link>
        </div>

        <div class="navbar-end">
          <a class="navbar-item" href="https://github.com/marshall-lab">
            <i class="fa-2x fab fa-github"></i>
          </a>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: "NavBar",
  data() {
    return {
      hamburgerActive: false
    };
  },
  methods: {
    toggleBurgerMenu() {
      this.hamburgerActive = !this.hamburgerActive;
    }
  }
};
</script>
