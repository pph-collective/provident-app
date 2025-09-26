<template>
  <nav class="navbar" role="navigation" aria-label="main navigation">
    <div class="container">
      <div class="navbar-brand">
        <router-link to="/" class="navbar-item">
          <img
            src="/assets/images/pori-provident-text-logo.png"
            width="112"
            height="28"
          />
        </router-link>

        <a
          role="button"
          :class="['navbar-burger', { 'is-active': hamburgerActive }]"
          data-cy="navbar-burger"
          aria-label="menu"
          aria-expanded="false"
          data-target="navbar-contents"
          @click="toggleBurgerMenu"
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </a>
      </div>

      <div
        id="navbar-contents"
        :class="['navbar-menu', { 'is-active': hamburgerActive }]"
        @click="toggleBurgerMenu"
      >
        <div class="navbar-start">
          <router-link
            data-cy="dashboard"
            to="/dashboard"
            class="navbar-item has-text-primary"
          >
            Dashboard
          </router-link>

          <router-link
            data-cy="resources"
            to="/resources"
            class="navbar-item has-text-primary"
          >
            Resources
          </router-link>
        </div>

        <div class="navbar-end">
          <div class="navbar-item">
            <p class="control">
              <a
                class="button is-primary is-small"
                href="https://preventoverdoseri.org/"
              >
                Back to PORI
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useMobileListener } from "../composables/useMobileListener";

const hamburgerActive = ref(false);
const toggleBurgerMenu = () => {
  hamburgerActive.value = !hamburgerActive.value;
};

// On window resize, collapse the hamburger menu always
const { isMobile } = useMobileListener();
watch(isMobile, () => {
  hamburgerActive.value = false;
});
</script>

<style lang="scss" scoped>
@import "@/assets/styles/main.scss";

.navbar {
  border-bottom: 1px solid #a4b1bf;
}

.navbar-start .navbar-item {
  font-size: 18px;
  font-weight: bold;
}
</style>
