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
            autocomplete="name"
          />
          <span class="icon is-small is-left">
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
      <div class="field">
        <p class="control has-icons-left">
          <input
            class="input"
            type="password"
            placeholder="Password"
            v-model="form.password"
            autocomplete="new-password"
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
            autocomplete="new-password"
          />
          <span class="icon is-small is-left">
            <i class="fas fa-lock"></i>
          </span>
        </p>
      </div>
      <div class="field is-grouped is-grouped-centered">
        <p class="control">
          <button
            class="button is-success"
            :disabled="!formValid.status"
            type="submit"
          >
            Request Access
          </button>
        </p>
      </div>
      <p v-if="error" class="has-text-danger">
        {{ error }}
      </p>
      <p v-if="formValid.message.length > 0" class="has-text-danger">
        {{ formValid.message }}
      </p>
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
import { reactive, ref, computed } from "vue";

import fb from "@/firebase";
import FormCard from "@/components/FormCard";

export default {
  components: {
    FormCard
  },
  setup() {
    // TODO: terms and conditions
    const form = reactive({
      email: "",
      name: "",
      organization: "",
      password: "",
      confirmPassword: ""
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

    const formValid = computed(() => {
      // all fields must be filled in
      if (
        Object.values(form).reduce(
          (acc, curr) => acc || curr.length === 0,
          false
        )
      ) {
        return { status: false, message: "" };
      } else if (form.password.length < 6 || form.confirmPassword.length < 6) {
        return { status: false, message: "" };
      } else if (form.password !== form.confirmPassword) {
        return {
          status: false,
          message: "password and confirmation do not match"
        };
      } else {
        return { status: true, message: "" };
      }
    });

    const register = async () => {
      try {
        await fb.auth.createUserWithEmailAndPassword(form.email, form.password);
        //scrub out password
        form.password = "";
        form.confirmPassword = "";
        await fb.auth.currentUser.updateProfile({ displayName: form.name });
        await fb.logout();
        // to do set display name
        await fb.db
          .collection("users")
          .doc(form.email)
          .set({
            email: form.email,
            name: form.name,
            organization: form.organization,
            status: "pending"
          });
        requested.value = true;
      } catch (err) {
        error.value = err.message;
      }
    };

    return {
      form,
      formValid,
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
