<template>
  <LoadingSpinner :loading="loading" />
  <div class="email container">
    <section>
      <div class="panel is-primary m-4 has-background-white">
        <p class="panel-heading">Emails</p>

        <div class="panel-block is-block">
          <div class="columns">
            <span class="column has-text-centered">
              <button
                id="compose-button"
                class="button is-primary"
                @click="showModal = true"
              >
                + Compose
              </button>
            </span>
          </div>
        </div>

        <div class="panel-tabs">
          <a
            v-for="tab in Object.keys(tabs)"
            :key="tab"
            :class="{ 'is-active': selectedTab === tab }"
            @click="selectedTab = tab"
            >{{ tab }}</a
          >
        </div>

        <div
          v-if="selectedEmails.length === 0"
          class="panel-block is-justify-content-center"
        >
          <span>No emails here</span>
        </div>
        <div
          v-for="(email, idx) in selectedEmails"
          v-else
          :key="'email-' + idx"
          class="panel-block"
        >
          <div class="email-row">
            <div class="level mb-2">
              <div class="level-left">
                <p class="level-item is-size-6">
                  <b>
                    {{ email.subject }}
                  </b>
                </p>
              </div>
              <div class="level-right has-text-centered">
                <PanelTag
                  :class="['is-' + (email.sent ? 'success' : 'warning')]"
                  label="send date"
                  :value="email.sendDate.slice(0, 10)"
                />
              </div>
            </div>
            <div class="is-flex is-flex-wrap-wrap">
              <span
                v-for="(address, addressIdx) in email.to"
                :key="addressIdx"
                class="tag is-info is-rounded is-light m-1"
              >
                {{ address }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="showModal && formQuestions.length > 0"
        v-esc="() => (closeFormRequest += 1)"
        class="modal"
        :class="{ 'is-active': showModal }"
      >
        <div class="modal-background" />
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">Compose Email</p>
            <button
              class="delete"
              aria-label="close"
              @click="closeFormRequest += 1"
            />
          </header>
          <section class="modal-card-body">
            <JSONForm
              v-if="showModal"
              :init-schema="formQuestions"
              :init-value="{}"
              :read-only="false"
              alt-button-label="Preview"
              :close-request="closeFormRequest"
              @alt="updatePreview"
              @submitted="submitEmail"
              @close="showModal = false"
            />

            <div class="container is-fluid">
              <label class="label" for="email-preview">Email preview</label>
              <p class="help">
                Note: Styling as the recipient will see it is highly dependent
                on their email client.
              </p>
              <article id="email-preview" class="message">
                <div class="message-header">
                  {{ preview.subject }}
                </div>
                <div class="message-body">
                  <!-- eslint-disable-next-line -->
                  <div class="content" v-html="preview.body" />
                </div>
              </article>
            </div>
          </section>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onUnmounted, ref } from "vue";
import { useStore } from "vuex";

import { db, createEmail } from "@/firebase.js";
import { collection, onSnapshot, query } from "firebase/firestore";
import { processEmailBody } from "@/utils/emails";
import formAssignmentUtils from "@/utils/formAssignment";
import { esc as vEsc } from "@/directives/escape";

import JSONForm from "@/components/form/JSONForm.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import PanelTag from "@/components/PanelTag.vue";

const emails = ref([]);
const showModal = ref(false);
const loading = ref(true);
const closeFormRequest = ref(0);
const preview = ref({
  body: processEmailBody("[body of the email...]"),
  subject: "[subject...]",
});

const store = useStore();
const organizations = computed(() => store.state.organizations);
const users = computed(() => store.getters.approvedUsers);

const tabs = {
  Pending: (email) => !email.sent,
  Sent: (email) => email.sent,
  All: () => true,
};
const selectedTab = ref(Object.keys(tabs)[0]);
const selectedEmails = computed(() =>
  emails.value.filter(tabs[selectedTab.value]),
);

const unsubEmails = onSnapshot(query(collection(db, "emails")), (snapshot) => {
  emails.value = snapshot.docs.map((doc) => doc.data());
  loading.value = false;
});
onUnmounted(unsubEmails);

const formQuestions = computed(() => {
  if (users.value.length === 0 || organizations.value.length === 0) {
    return [];
  }

  const userOptions = store.getters.formUserOptions;
  const organizationOptions = store.getters.formOrganizationOptions;
  const groups = formAssignmentUtils.TARGET_GROUPS;

  return [
    {
      component: "Select",
      multiple: true,
      label: "Email groups",
      model: "target_groups",
      options: groups,
    },
    {
      component: "Select",
      multiple: true,
      label: "Email organizations",
      model: "target_organizations",
      options: organizationOptions,
    },
    {
      component: "Select",
      multiple: true,
      label: "Email users",
      model: "target_users",
      default: [],
      options: userOptions,
    },
    {
      component: "Date",
      label: "Send Date",
      help_text: "The date when the email will be sent to users.",
      model: "send_date",
      required: true,
      min_date: "today",
    },
    {
      component: "TextInput",
      label: "Subject",
      model: "subject",
      required: true,
    },
    {
      component: "TextArea",
      label: "Body",
      help_text:
        "HTML body of the email to send (e.g. `<p>Hello, <a href='earth.google.com'>World</a></p>`).  Click preview button to see preview below.",
      model: "body",
      required: true,
    },
  ];
});

const submitEmail = async ({
  target_groups = [],
  target_organizations = [],
  target_users = [],
  send_date,
  subject,
  body,
}) => {
  const target = {
    users: target_users,
    organizations: target_organizations,
    groups: target_groups,
  };

  const { emails: to } = formAssignmentUtils.getAssignments(
    "user",
    target,
    organizations.value,
    users.value,
  );

  try {
    await createEmail({
      subject,
      body,
      to,
      sendDate: send_date,
    });
    showModal.value = false;
  } catch (err) {
    console.log(err);
  }
};

const updatePreview = ({ body, subject }) => {
  subject = subject || "No subject";
  preview.value = { body: processEmailBody(body), subject };
};
</script>

<style lang="scss" scoped>
.email-row {
  width: 100%;
}
</style>
