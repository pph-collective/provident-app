<template>
  <FormCard>
    <h1 class="is-size-3 has-text-centered pb-3">Log In</h1>
    <form @submit.prevent="submit">
      <div class="field">
        <p class="control has-icons-left has-icons-right">
          <input
            class="input"
            type="text"
            placeholder="Reset Code"
            v-model="form.resetCode"
          />
          <span class="icon is-small is-left">
            <i class="fas fa-shield-alt"></i>
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
          />
          <span class="icon is-small is-left">
            <i class="fas fa-lock"></i>
          </span>
        </p>
      </div>
      <div class="field">
        <p class="control has-icons-left">
          <input
            class="input"
            type="password"
            placeholder="Confirm Password"
            v-model="form.confirmPassword"
          />
          <span class="icon is-small is-left">
            <i class="fas fa-lock"></i>
          </span>
        </p>
      </div>
      <div class="field is-grouped is-grouped-centered">
        <p class="control">
          <button class="button is-success" type="submit">
            Update Password
          </button>
        </p>
      </div>
      <p v-if="error" class="has-text-danger">{{ error }}</p>
      <p v-if="formValid.length > 0" class="has-text-danger">{{ formValid }}</p>
    </form>
  </FormCard>
</template>

<script>
import { ref, reactive } from "vue";
import { useRoute } from "vue-router";

import fb from "@/firebase";
import FormCard from "@/components/FormCard";

export default {
  components: {
    FormCard
  },
  setup() {
    const route = useRoute();

    const form = reactive({
      resetCode: route.query.oobCode ? route.query.oobCode : "",
      password: "",
      confirmPassword: ""
    });
    const error = ref(null);

    const formValid = () => {
      if (form.password !== form.confirmPasword) {
        return "password and confirmation do not match";
      } else {
        return "";
      }
    };

    const submit = async () => {
      try {
        await fb.auth.confirmPasswordReset(
          this.form.resetCode,
          this.form.password
        );
        this.$router.replace({ name: "Login" });
      } catch (err) {
        this.error = `${err.message}`;
      }
    };

    return {
      form,
      error,
      formValid,
      submit
    };
  }
};
</script>
