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
            data-cy="home"
            to="/"
            class="navbar-item has-text-primary"
          >
            Home
          </router-link>

          <router-link
            data-cy="dashboard"
            to="/snack/dashboard"
            class="navbar-item has-text-primary"
          >
            Dashboard
          </router-link>

          <router-link
            data-cy="forms"
            to="/snack/forms"
            class="navbar-item has-text-primary"
          >
            Forms
          </router-link>

          <router-link
            v-if="user.admin"
            data-cy="admin"
            to="/admin"
            class="navbar-item has-text-primary"
          >
            Admin
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
                  <i
                    class="fas"
                    :class="{
                      'fa-user-circle': user.data.role === 'user',
                      'fa-crown': user.data.role === 'champion',
                    }"
                  />
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
      logout,
    };
  },
};
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
