<template>
  <FormCard>
    <h1 class="is-size-3 has-text-centered pb-3">Request Access</h1>
    <form v-if="!requested" @submit.prevent="register">
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
          <span class="icon is-small">
            <i class="fas fa-user-circle"></i>
          </span>
        </p>
      </div>
      <div class="field">
        <div class="control has-icons-left">
          <div class="select">
            <select v-model="form.organization">
              <option
                v-for="organization in organizations"
                v-bind:value="organization"
                :key="organization"
              >
                {{ organization }}
              </option>
            </select>
          </div>
          <div class="icon is-small is-left">
            <i class="fas fa-sitemap"></i>
          </div>
        </div>
      </div>
      <div class="field is-grouped is-grouped-centered">
        <p class="control">
          <button class="button is-success" type="submit">
            Request Access
          </button>
        </p>
        <p v-if="error" class="has-text-danger">
          <strong>{{ error }}</strong>
        </p>
      </div>
    </form>
    <div v-else class="is-flex is-flex-direction-column">
      <p><strong>Your request has been received.</strong></p>
      <p>
        An administrator will review your request and respond within a week.
      </p>
      <button
        class="button my-2 is-info is-centered"
        @click="$router.push('/')"
      >
        Back to Home
      </button>
    </div>
  </FormCard>
</template>

<script>
import { reactive, ref } from "vue";
import fb from "@/firebase";
import FormCard from "@/components/FormCard";

export default {
  components: {
    FormCard
  },
  setup() {
    const form = reactive({
      email: "",
      name: "",
      organization: "" // make this a dropdown
    });
    const requested = ref(false);
    const error = ref(null);
    const organizations = ref([]);

    fb.db
      .collection("organizations")
      .get()
      .then(snapshot => {
        organizations.value = snapshot.docs.map(doc => doc.data().name);
      });

    const register = async () => {
      try {
        await fb.db.collection("user_requests").add({ ...form });
        requested.value = true;
      } catch (err) {
        error.value = err.message;
      }
    };

    return {
      form,
      requested,
      error,
      organizations,
      register
    };
  }
};
</script>

<style>
.select {
  width: 100%;
}

.select select {
  width: 100%;
}
</style>
