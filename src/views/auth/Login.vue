<template>
  <FormCard>
    <h1 class="is-size-3 has-text-centered pb-3">Log In</h1>
    <form @submit.prevent="submit">
      <div class="field">
        <p class="control has-icons-left has-icons-right">
          <input
            v-model="form.email"
            class="input"
            name="email"
            type="email"
            placeholder="Email"
            autocomplete="email"
            required
          />
          <span class="icon is-small is-left">
            <i class="fas fa-envelope" />
          </span>
        </p>
      </div>
      <div class="field">
        <p class="control has-icons-left">
          <input
            v-model="form.password"
            class="input"
            name="password"
            type="password"
            placeholder="Password"
            autocomplete="current-password"
            required
          />
          <span class="icon is-small is-left">
            <i class="fas fa-lock" />
          </span>
        </p>
        <p class="has-text-right">
          <a data-cy="reset-password" @click="resetRequest">reset password</a>
        </p>
      </div>
      <div class="field is-grouped is-grouped-centered">
        <p class="control">
          <button
            class="button is-primary"
            type="submit"
            :class="{ 'is-loading': buttonLoading }"
            data-cy="login-form-button"
          >
            Log In
          </button>
        </p>
        <p class="control">
          <button
            class="button is-light"
            type="button"
            data-cy="request-access-button"
            @click="$router.push('/register')"
          >
            Request Access
          </button>
        </p>
      </div>
      <p v-if="error" data-cy="error-message" class="has-text-danger">
        {{ error }}
      </p>
    </form>
  </FormCard>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watchEffect } from "vue";
import { useStore } from "vuex";
import { useRouter, useRoute } from "vue-router";

import { auth, getUserRequest, login, logout } from "../../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import FormCard from "../../components/FormCard.vue";

const form = reactive({ email: "", password: "" });
const error = ref(null);
const buttonLoading = ref(false);

const store = useStore();
const userAuthenticated = computed(() => store.state.user.authenticated);

const router = useRouter();
const route = useRoute();

// handle case of user log in via cookie post redirect
watchEffect(() => {
  if (userAuthenticated.value && route.query.redirect) {
    router.push(route.query.redirect);
  }
});

const submit = async () => {
  buttonLoading.value = true;
  const email = form.email.toLowerCase();
  try {
    await login(email, form.password);
    const { status } = await getUserRequest(email);
    if (status === "approved") {
      if (route.query.redirect) {
        await router.push(route.query.redirect);
      } else {
        await router.push({ name: "Home" });
      }
    } else if (status === undefined) {
      error.value = `User account was not set up properly. Please reach out to ${
        import.meta.env.VITE_APP_ADMIN_EMAIL
      } with the email you used to register.`;
      await logout();
    } else {
      error.value = `User account not approved: ${status}`;
      await logout();
    }
  } catch (err) {
    error.value = err.message;
    await logout();
    console.log(err);
  }
  buttonLoading.value = false;
};

const resetRequest = async () => {
  if (!form.email || !form.email.includes("@")) {
    error.value = "Enter an email and then click reset password.";
    return;
  }

  try {
    await sendPasswordResetEmail(auth, form.email.toLowerCase());
    store.dispatch("addNotification", {
      message: "Success. Check your email to reset your password.",
    });
    error.value = null;
  } catch (err) {
    if (err.message === "Firebase: Error (auth/user-not-found).") {
      error.value =
        "There is no user record corresponding to this identifier. The user may have been deleted.";
    } else {
      error.value = err.message;
    }
  }
};
</script>
