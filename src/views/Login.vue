<template>
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
          />
          <span class="icon is-small is-left">
            <i class="fas fa-lock"></i>
          </span>
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
      error: null
    };
  },
  methods: {
    async submit() {
      try {
        console.log(this.form);
        let res = await fb.login(this.form.email, this.form.password);
        console.log(res);
        if (window.history.length > 1) {
          this.$router.back();
        } else {
          this.$router.replace({ name: "Snack" });
        }
      } catch (err) {
        console.log(err);
      }
    }
  }
};
</script>
