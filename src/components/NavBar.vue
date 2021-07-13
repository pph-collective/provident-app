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
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div
        id="navbar-contents"
        @click="toggleBurgerMenu"
        :class="['navbar-menu', { 'is-active': hamburgerActive }]"
      >
        <div class="navbar-start">
          <router-link
            data-cy="home"
            to="/"
            class="navbar-item has-text-primary"
            >Home</router-link
          >

          <router-link
            data-cy="snack"
            to="/snack"
            class="navbar-item has-text-primary"
            >Snack</router-link
          >

          <router-link
            data-cy="about"
            to="/about"
            class="navbar-item has-text-primary"
            >About</router-link
          >

          <router-link
            v-if="user.admin"
            data-cy="admin"
            to="/admin"
            class="navbar-item has-text-primary"
            >Admin</router-link
          >
        </div>

        <div class="navbar-end">
          <div v-if="!user.authenticated" class="navbar-item">
            <p class="control">
              <router-link
                to="/login"
                class="button is-primary is-small"
                data-cy="login-button"
              >
                Log In
              </router-link>
            </p>
          </div>
          <div v-else class="is-flex is-flex-row navbar-item">
            <div class="navbar-item is-hidden-touch">
              <span class="icon-text has-text-primary">
                <span class="icon">
                  <i class="fas fa-user-circle"></i>
                </span>
                <span>{{ user.data.displayName }}</span>
              </span>
            </div>
            <p class="control">
              <a
                class="button is-primary is-small"
                data-cy="logout-button"
                @click="logout"
              >
                Log Out
              </a>
            </p>
          </div>

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

<script>
import { computed, ref, watch } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { useMobileListener } from "@/composables/useMobileListener";
import fb from "@/firebase";

export default {
  setup() {
    const store = useStore();
    const user = computed(() => store.state.user);

    const hamburgerActive = ref(false);
    const toggleBurgerMenu = () => {
      hamburgerActive.value = !hamburgerActive.value;
    };

    const router = useRouter();

    const logout = async () => {
      await fb.logout();
      await router.push("/");
    };

    // On window resize, collapse the hamburger menu always
    const { isMobile } = useMobileListener();
    watch(isMobile, () => {
      hamburgerActive.value = false;
    });

    return {
      user,
      hamburgerActive,
      toggleBurgerMenu,
      logout
    };
  }
};
</script>

<style lang="scss" scoped>
.navbar-start .navbar-item {
  font-size: 18px;
  font-weight: bold;
}
</style>
