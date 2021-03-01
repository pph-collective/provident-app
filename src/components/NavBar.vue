<template>
  <nav class="navbar is-dark" role="navigation" aria-label="main navigation">
    <div class="container">
      <div class="navbar-brand">
        <router-link to="/" class="navbar-item">
          <img
            src="assets/images/provident-text-logo.png"
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

          <router-link v-if="user.admin" to="/admin" class="navbar-item"
            >Admin</router-link
          >
        </div>

        <div class="navbar-end">
          <button
            v-if="!user.authenticated"
            class="button my-2"
            @click="$router.push('login')"
          >
            Log In
          </button>
          <button v-else class="button my-2" @click="logout">Log Out</button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { mapState } from "vuex";

import fb from "@/firebase";

export default {
  name: "NavBar",
  data() {
    return {
      hamburgerActive: false
    };
  },
  computed: {
    ...mapState(["user"])
  },
  methods: {
    toggleBurgerMenu() {
      this.hamburgerActive = !this.hamburgerActive;
    },
    logout() {
      fb.logout();
      this.$router.push("/");
    }
  }
};
</script>
