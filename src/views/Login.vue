<template>
  <div v-if="alert.length > 0" class="notification is-primary">
    <button @click="dismissAlert" class="delete"></button>
    {{ alert }}
  </div>
  <FormCard>
    <h1 class="is-size-3 has-text-centered pb-3">Log In</h1>
    <form @submit.prevent="submit">
      <div class="field">
        <p class="control has-icons-left has-icons-right">
          <input
            class="input"
            type="email"
            placeholder="Email"
            v-model="form.email"
            autocomplete="username"
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
            type="password"
            placeholder="Password"
            v-model="form.password"
            autocomplete="current-password"
          />
          <span class="icon is-small is-left">
            <i class="fas fa-lock"></i>
          </span>
        </p>
        <p class="has-text-right">
          <a @click="resetRequest">reset password</a>
        </p>
      </div>
      <div class="field is-grouped is-grouped-centered">
        <p class="control">
          <button class="button is-primary" type="submit">
            Log In
          </button>
        </p>
        <p class="control">
          <button
            class="button is-light"
            type="button"
            @click="$router.push('/register')"
          >
            Request Access
          </button>
        </p>
      </div>
      <p v-if="error" id="error-message" class="has-text-danger">{{ error }}</p>
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
    FormCard
  },
  setup() {
    const form = reactive({ email: "", password: "" });
    const error = ref(null);
    const alert = ref("");

    const store = useStore();
    const userAuthenticated = computed(() => store.state.user.authenticated);

    const router = useRouter();
    const route = useRoute();

    // handle case of user log in via cookie post redirect
    watchEffect(() => {
      if (userAuthenticated.value && route.query.redirect && form.email == "") {
        router.push(route.query.redirect);
      }
    });

    const submit = async () => {
      try {
        await fb.login(form.email, form.password);
        const { status } = await fb.getUserRequest(form.email);
        if (status === "approved") {
          if (route.query.redirect) {
            router.push(route.query.redirect);
          } else {
            console.error("no redirect found");
          }
        } else {
          error.value = `User account not approved: ${status}`;
          await fb.logout();
        }
      } catch (err) {
        error.value = err.message;
        await fb.logout();
        console.log(err);
      }
    };

    const resetRequest = async () => {
      try {
        await fb.auth.sendPasswordResetEmail(form.value.email);
        this.alert = "Success. Check your email to reset your password.";
        error.value = null;
      } catch (err) {
        error.value = err.message;
      }
    };

    const dismissAlert = () => {
      alert.value = "";
    };

    return {
      submit,
      resetRequest,
      dismissAlert,
      form,
      alert,
      error
    };
  }
};
</script>
