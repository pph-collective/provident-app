<template>
  <LoadingSpinner :loading="loading" />
  <FormCard>
    <h1 class="is-size-3 has-text-centered pb-3">Request Access</h1>
    <form v-if="!requested" @submit.prevent="register">
      <div class="field">
        <p class="control has-icons-left has-icons-right">
          <input
            v-model="form.email"
            name="email"
            class="input"
            type="email"
            placeholder="Email"
            autocomplete="email"
          />
          <span class="icon is-small is-left">
            <i class="fas fa-envelope" />
          </span>
        </p>
      </div>
      <div class="field">
        <p class="control has-icons-left">
          <input
            v-model="form.name"
            name="name"
            class="input"
            type="text"
            data-cy="form-name"
            placeholder="Full Name"
            autocomplete="name"
          />
          <span class="icon is-small is-left">
            <i class="fas fa-user-circle" />
          </span>
        </p>
      </div>
      <div class="field">
        <div class="control has-icons-left">
          <div class="select">
            <select v-model="form.organization" data-cy="form-organization">
              <option
                v-for="organization in organizations"
                :key="organization"
                :value="organization"
              >
                {{ organization }}
              </option>
            </select>
          </div>
          <div class="icon is-small is-left">
            <i class="fas fa-sitemap" />
          </div>
        </div>
      </div>
      <div v-if="form.organization === 'Other'" class="field">
        <p class="control has-icons-left">
          <input
            v-model="form.organizationName"
            class="input"
            type="text"
            data-cy="form-organization-name"
            placeholder="Organization"
          />
          <span class="icon is-small is-left">
            <i class="fas fa-sitemap" />
          </span>
        </p>
      </div>
      <div class="field">
        <p class="control has-icons-left">
          <input
            v-model="form.password"
            class="input"
            type="password"
            data-cy="form-password"
            placeholder="Password"
            autocomplete="new-password"
          />
          <span class="icon is-small is-left">
            <i class="fas fa-lock" />
          </span>
        </p>
      </div>
      <div class="field">
        <p class="control has-icons-left">
          <input
            v-model="form.confirmPassword"
            class="input"
            type="password"
            data-cy="form-confirm-password"
            placeholder="Confirm Password"
            autocomplete="new-password"
          />
          <span class="icon is-small is-left">
            <i class="fas fa-lock" />
          </span>
        </p>
      </div>
      <div class="field">
        <div class="control">
          <label class="checkbox">
            <input
              v-model="form.terms"
              type="checkbox"
              data-cy="form-terms-and-conditions"
            />
            I agree to the
            <a
              tabindex="0"
              @click.prevent="showTerms = true"
              @keyup.enter.prevent="showTerms = true"
              >research terms and conditions</a
            >
          </label>
        </div>
      </div>
      <div class="field">
        <div class="control">
          <label class="checkbox">
            <input
              v-model="form.termsLawEnforcement"
              type="checkbox"
              data-cy="form-terms-law-enforcement"
            />
            I am not a member of
            <a
              tabindex="0"
              @click.prevent="showTermsLawEnforcement = true"
              @keyup.enter.prevent="showTermsLawEnforcement = true"
              >law enforcement</a
            >
          </label>
        </div>
      </div>
      <div class="field">
        <div class="control">
          <label class="checkbox">
            <input
              v-model="form.termsMetadata"
              type="checkbox"
              data-cy="form-terms-metadata"
            />
            I agree to the
            <a
              tabindex="0"
              @click.prevent="showTermsMetadata = true"
              @keyup.enter.prevent="showTermsMetadata = true"
              >collection of metadata</a
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
      <div class="modal-background" />
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Terms &amp; Conditions</p>
          <button
            v-esc="() => (showTerms = false)"
            autofocus
            class="delete"
            aria-label="close"
            @click="showTerms = false"
          />
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

    <div v-if="showTermsLawEnforcement" class="modal is-active">
      <div class="modal-background" />
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">
            Why do we restrict access to our web tool?
          </p>
          <button
            v-esc="() => (showTermsLawEnforcement = false)"
            autofocus
            class="delete"
            aria-label="close"
            @click="showTermsLawEnforcement = false"
          />
        </header>
        <section class="modal-card-body content">
          <p>
            The PROVIDENT Web Tool is intended to be used by community
            organizations. We want to minimize the chance that detailed
            neighborhood information is used for targeted policing.
          </p>
        </section>
      </div>
    </div>

    <div v-if="showTermsMetadata" class="modal is-active">
      <div class="modal-background" />
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">What metadata do we collect?</p>
          <button
            v-esc="() => (showTermsMetadata = false)"
            autofocus
            class="delete"
            aria-label="close"
            @click="showTermsMetadata = false"
          />
        </header>
        <section class="modal-card-body content">
          <p>
            Metadata helps us understand how people are using the tool. It also
            helps us improve our web tool. Metadata we collect includes the
            number of logins, time spent using the map, and which neighborhoods
            are being selected.
          </p>
        </section>
      </div>
    </div>
  </teleport>
</template>

<script>
import { reactive, ref, computed } from "vue";
import { useStore } from "vuex";

import { auth, db, createEmail, logout } from "@/firebase";
import { setDoc, doc } from "firebase/firestore";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { esc } from "@/directives/escape";
import FormCard from "@/components/FormCard.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";

export default {
  components: {
    FormCard,
    LoadingSpinner,
  },
  directives: {
    ...esc,
  },
  setup() {
    const form = reactive({
      email: "",
      name: "",
      organization: "",
      organizationName: "",
      password: "",
      confirmPassword: "",
      terms: false,
    });
    const requested = ref(false);
    const error = ref(null);
    const showTerms = ref(false);
    const showTermsLawEnforcement = ref(false);
    const showTermsMetadata = ref(false);
    const loading = ref(false);

    const store = useStore();
    const organizations = computed(() => store.getters.formOrganizationOptions);

    const formValid = computed(() => {
      // all fields must be filled in
      if (
        !(
          form.email &&
          form.name &&
          form.organization &&
          form.password &&
          form.confirmPassword &&
          form.terms
        )
      ) {
        return { status: false, message: "" };
      } else if (form.organization === "Other" && !form.organizationName) {
        return {
          status: false,
          message: "What organization are you a part of?",
        };
      } else if (form.password.length < 6 || form.confirmPassword.length < 6) {
        return { status: false, message: "" };
      } else if (form.password !== form.confirmPassword) {
        return {
          status: false,
          message: "password and confirmation do not match",
        };
      } else if (
        !form.terms ||
        !form.termsLawEnforcement ||
        !form.termsMetadata
      ) {
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
      const email = form.email.toLowerCase();

      try {
        await createUserWithEmailAndPassword(auth, email, form.password);
        //scrub out password
        form.password = "";
        form.confirmPassword = "";
        await updateProfile(auth.currentUser, { displayName: form.name });
        await setDoc(doc(db, "users", email), {
          email,
          name: form.name,
          organization: form.organization,
          organizationName:
            form.organization === "Other"
              ? form.organizationName
              : form.organization,
          role: "user",
          status: "pending",
        });

        requested.value = true;
      } catch (err) {
        if (err.message === "Firebase: Error (auth/email-already-in-use).") {
          error.value =
            "The email address is already in use by another account.";
        } else {
          error.value = err.message;
        }
        console.log(err);
      }

      if (requested.value) {
        try {
          await createEmail({
            subject: "PROVIDENT User Request",
            body: `<p>${form.name} (${email} from ${form.organization}) has requested access to PROVIDENT. <a href="${location.origin}/admin">View the request.</a></p>`,
            to: [import.meta.env.VITE_APP_ADMIN_EMAIL],
          });
          await createEmail({
            subject: "PROVIDENT Access Request",
            body: `<p>Hello ${
              form.name
            },</p><br><p>Your request to access PROVIDENT has been received. An administrator will review and respond within a week. If it has been a while and you haven't heard anything, please reach out to <a href='mailto:${
              import.meta.env.VITE_APP_ADMIN_EMAIL
            }'>the PROVIDENT admin</a>.</p>`,
            to: [email],
          });
        } catch (e) {
          console.log(e);
        }
      }
      await logout();
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
      showTermsLawEnforcement,
      showTermsMetadata,
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
