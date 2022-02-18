<template>
  <Loading :loading="loading" />
  <FormCard>
    <h1 class="is-size-3 has-text-centered pb-3">Request Access</h1>
    <form v-if="!requested" @submit.prevent="register">
      <div class="field">
        <p class="control has-icons-left has-icons-right">
          <input
            name="email"
            class="input"
            type="email"
            placeholder="Email"
            v-model="form.email"
            autocomplete="email"
          />
          <span class="icon is-small is-left">
            <i class="fas fa-envelope"></i>
          </span>
        </p>
      </div>
      <div class="field">
        <p class="control has-icons-left">
          <input
            name="name"
            class="input"
            type="text"
            data-cy="form-name"
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
            <select v-model="form.organization" data-cy="form-organization">
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
            data-cy="form-password"
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
            data-cy="form-confirm-password"
            placeholder="Confirm Password"
            v-model="form.confirmPassword"
            autocomplete="new-password"
          />
          <span class="icon is-small is-left">
            <i class="fas fa-lock"></i>
          </span>
        </p>
      </div>
      <div class="field">
        <div class="control">
          <label class="checkbox">
            <input type="checkbox" v-model="form.terms" data-cy="form-terms" />
            I agree to the
            <a
              @click.prevent="showTerms = true"
              @keyup.enter.prevent="showTerms = true"
              tabindex="0"
              >terms and conditions</a
            >
          </label>
        </div>
      </div>
      <div class="field is-grouped is-grouped-centered">
        <p class="control">
          <button
            data-cy="request-access-button"
            class="button is-success"
            :disabled="!formValid.status || loading"
            type="submit"
          >
            Request Access
          </button>
        </p>
      </div>
      <p v-if="error" data-cy="error-message" class="has-text-danger">
        {{ error }}
      </p>
      <p v-if="formValid.message.length > 0" class="has-text-danger">
        {{ formValid.message }}
      </p>
    </form>
    <div
      v-else
      data-cy="success-message"
      class="is-flex is-flex-direction-column"
    >
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

  <teleport to="body">
    <div v-if="showTerms" class="modal is-active">
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Terms &amp; Conditions</p>
          <button
            autofocus
            class="delete"
            aria-label="close"
            @click="showTerms = false"
            v-esc="() => (showTerms = false)"
          ></button>
        </header>
        <section class="modal-card-body content">
          <h3>Welcome to the PROVIDENT Web Tool!</h3>

          <p>
            We are so thankful for your participation in this research study.
            Our goal is to reduce overdose in our state and we hope that this
            new tool can help us in that fight. Our study team is comprised of
            staff members at the People, Place, and Health Collective at the
            Brown University School of Public Health.
          </p>

          <p>
            This is a new kind of tool for fighting overdose. And because this
            is a research study, we need to figure out whether or not this tool
            actually works to lower overdoses in our state. To do this, we keep
            track of some of your data while using the Web Tool. When you use
            the PROVIDENT Web Tool, we will be keeping track of things like how
            often you are using the tool, and how you are using it. This
            information is helpful for our study and can help us understand how
            to improve the tool. Your individual data will never be shared. No
            information from this study will be shared with law enforcement. All
            of your information, like your name and email address, will only be
            used within PROVIDENT and never shared or used elsewhere.
          </p>

          <p>
            By signing up, you agree to let us collect this information. We may
            also send you emails as part of the PROVIDENT Study.
          </p>
        </section>
      </div>
    </div>
  </teleport>
</template>

<script>
import { reactive, ref, computed } from "vue";
import { useStore } from "vuex";

import fb from "@/firebase";
import { esc } from "@/directives/escape";
import FormCard from "@/components/FormCard";
import Loading from "@/components/Loading.vue";

export default {
  components: {
    FormCard,
    Loading,
  },
  directives: {
    ...esc,
  },
  setup() {
    const form = reactive({
      email: "",
      name: "",
      organization: "",
      password: "",
      confirmPassword: "",
      terms: false,
    });
    const requested = ref(false);
    const error = ref(null);
    const showTerms = ref(false);
    const loading = ref(false);

    const store = useStore();
    const organizations = computed(() => store.getters.formOrganizationOptions);

    const formValid = computed(() => {
      // all fields must be filled in
      if (Object.values(form).reduce((acc, curr) => acc || !curr, false)) {
        return { status: false, message: "" };
      } else if (form.password.length < 6 || form.confirmPassword.length < 6) {
        return { status: false, message: "" };
      } else if (form.password !== form.confirmPassword) {
        return {
          status: false,
          message: "password and confirmation do not match",
        };
      } else if (!form.terms) {
        return {
          status: false,
          message: "",
        };
      } else {
        return { status: true, message: "" };
      }
    });

    const register = async () => {
      loading.value = true;

      try {
        await fb.auth.createUserWithEmailAndPassword(form.email, form.password);
        //scrub out password
        form.password = "";
        form.confirmPassword = "";
        await fb.auth.currentUser.updateProfile({ displayName: form.name });
        await fb.db.collection("users").doc(form.email).set({
          email: form.email,
          name: form.name,
          organization: form.organization,
          role: "user",
          status: "pending",
        });

        requested.value = true;
      } catch (err) {
        error.value = err.message;
      }

      if (requested.value) {
        try {
          await fb.createEmail({
            subject: "PROVIDENT User Request",
            body: `<p>${form.name} (${form.email} from ${form.organization}) has requested access to PROVIDENT. <a href="${location.origin}/admin">View the request.</a></p>`,
            to: [process.env.VUE_APP_ADMIN_EMAIL],
          });
          await fb.createEmail({
            subject: "PROVIDENT Access Request",
            body: `<p>Hello ${form.name},</p><br><p>Your request to access PROVIDENT has been received. An administrator will review and respond within a week. If it has been a while and you haven't heard anything, please reach out to <a href='mailto:${process.env.VUE_APP_ADMIN_EMAIL}'>the PROVIDENT admin</a>.</p>`,
            to: [form.email],
          });
        } catch (e) {
          console.log(e);
        }
      }
      await fb.logout();
      loading.value = false;
    };

    return {
      form,
      formValid,
      requested,
      error,
      loading,
      organizations,
      register,
      showTerms,
    };
  },
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
