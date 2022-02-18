<template>
  <FormCard>
    <h1 class="is-size-3 has-text-centered pb-3">Log In</h1>
    <form @submit.prevent="submit">
      <div class="field">
        <p class="control has-icons-left has-icons-right">
          <input
            class="input"
            name="email"
            type="email"
            placeholder="Email"
            v-model="form.email"
            autocomplete="email"
            required
          />
          <span class="icon is-small is-left">
            <i class="fas fa-envelope"></i>
          </span>
        </p>
      </div>
      <div class="field">
        <p class="control has-icons-left">
          <input
            class="input"
            name="password"
            type="password"
            placeholder="Password"
            v-model="form.password"
            autocomplete="current-password"
            required
          />
          <span class="icon is-small is-left">
            <i class="fas fa-lock"></i>
          </span>
        </p>
        <p class="has-text-right">
          <a @click="resetRequest" data-cy="reset-password">reset password</a>
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

<script>
import { reactive, ref, computed, watchEffect } from "vue";
import { useStore } from "vuex";
import { useRouter, useRoute } from "vue-router";

import fb from "@/firebase";
import FormCard from "@/components/FormCard";

export default {
  components: {
    FormCard,
  },
  setup() {
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
      try {
        await fb.login(form.email, form.password);
        const { status } = await fb.getUserRequest(form.email);
        if (status === "approved") {
          if (route.query.redirect) {
            await router.push(route.query.redirect);
          } else {
            await router.push({ name: "Home" });
          }
        } else if (status === undefined) {
          error.value = `User account was not set up properly. Please reach out to ${process.env.VUE_APP_ADMIN_EMAIL} with the email you used to register.`;
        } else {
          error.value = `User account not approved: ${status}`;
          await fb.logout();
        }
      } catch (err) {
        error.value = err.message;
        await fb.logout();
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
        await fb.auth.sendPasswordResetEmail(form.email);
        store.dispatch("addNotification", {
          message: "Success. Check your email to reset your password.",
        });
        error.value = null;
      } catch (err) {
        error.value = err.message;
      }
    };

    return {
      buttonLoading,
      submit,
      resetRequest,
      form,
      error,
    };
  },
};
</script>
