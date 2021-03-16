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
          <button class="button is-success" type="submit">
            Log In
          </button>
        </p>
        <p class="control">
          <button class="button is-light" @click="$router.push('/register')">
            Request Access
          </button>
        </p>
      </div>
      <p v-if="error" class="has-text-danger">{{ error }}</p>
    </form>
  </FormCard>
</template>

<script>
import fb from "@/firebase";
import FormCard from "@/components/FormCard";

export default {
  components: {
    FormCard
  },
  data() {
    return {
      form: {
        email: "",
        password: ""
      },
      error: null,
      alert: ""
    };
  },
  methods: {
    async submit() {
      try {
        await fb.login(this.form.email, this.form.password);
        const { status } = await fb.getUserRequest(this.form.email);
        if (status === "approved") {
          if (this.$route.query.redirect) {
            this.$router.push(this.$route.query.redirect);
          } else {
            this.$router.back();
          }
        } else {
          this.error = `User account not approved: ${status}`;
          await fb.logout();
        }
      } catch (err) {
        this.error = err.message;
        await fb.logout();
        console.log(err);
      }
    },
    async resetRequest() {
      try {
        await fb.auth.sendPasswordResetEmail(this.form.email);
        this.alert = "Success. Check your email to reset your password.";
        this.error = null;
      } catch (err) {
        this.error = err.message;
      }
    },
    dismissAlert() {
      this.alert = "";
    }
  }
};
</script>
