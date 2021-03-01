<template>
  <FormCard>
    <h1 class="is-size-3 has-text-centered pb-3">Request Access</h1>
    <form @submit.prevent="register">
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
            type="text"
            placeholder="Full Name"
            v-model="form.name"
          />
          <span class="icon is-small is-left">
            <i class="fas fa-user-circle"></i>
          </span>
        </p>
      </div>
      <div class="field">
        <p class="control has-icons-left">
          <input
            class="input"
            type="text"
            placeholder="Organization"
            v-model="form.organization"
          />
          <span class="icon is-small is-left">
            <i class="fas fa-sitemap"></i>
          </span>
        </p>
      </div>
      <div class="field is-grouped is-grouped-centered">
        <p class="control">
          <button class="button is-success" type="submit">
            Request Access
          </button>
        </p>
        <p v-if="requested">Requested!</p>
        <p v-if="error">{{ error }}</p>
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
        name: "",
        organization: "" // make this a dropdown
      },
      requested: false,
      error: null
    };
  },
  methods: {
    async register() {
      try {
        console.log(this.form);
        let res = await fb.db.collection("user_requests").add({ ...this.form });
        console.log(res);
        this.requested = true;
      } catch (err) {
        this.error = err.message;
        console.log(err);
      }
    }
  }
};
</script>
