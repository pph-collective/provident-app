<template>
  <Loading :loading="loading" />
  <div class="container">
    <section>
      <div class="panel is-primary m-4 had-background-white">
        <p class="panel-heading">Emails</p>

        <div class="panel-block is-block">
          <div class="columns">
            <span class="column has-text-centered">
              <button
                class="button is-primary"
                data-cy="create-button"
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
          v-else
          v-for="(email, idx) in selectedEmails"
          :key="'email-' + idx"
          class="panel-block"
        >
          <div class="form-assignment-row">
            <div class="level">
              <div class="level-left">
                <p class="level-item is-size-5">
                  <b>
                    {{ email.subject }}
                  </b>
                </p>
              </div>
              <div class="level-right has-text-centered">
                <span
                  class="level-item tag is-success is-light"
                  data-cy="release-date-tag"
                  ><p><strong>SEND DATE:</strong> {{ email.sendDate }}</p></span
                >
              </div>
            </div>
            <div class="level">
              <div class="level-left">
                <span class="level-item">
                  <p class="px-4"><b>To:</b></p>
                </span>
                <div class="level-item">
                  <div class="tags has-addons" data-cy="target-tags">
                    <span
                      v-for="(address, idx) in email.to"
                      :key="idx"
                      class="tag is-info is-rounded is-light"
                    >
                      {{ address }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="showModal && formQuestions.length > 0"
          class="modal"
          :class="{ 'is-active': showModal }"
          data-cy="form-assignment-modal"
          v-esc="() => (closeFormRequest += 1)"
        >
          <div class="modal-background"></div>
          <div class="modal-card">
            <header class="modal-card-head">
              <p class="modal-card-title">Create New Form Assignment</p>
              <button
                class="delete"
                aria-label="close"
                @click="closeFormRequest += 1"
              ></button>
            </header>
            <section class="modal-card-body">
              <JSONForm
                v-if="showModal"
                :init-schema="formQuestions"
                :init-value="{}"
                :read-only="false"
                :showSaveButton="false"
                :close-request="closeFormRequest"
                @submitted="createFormAssignment($event)"
                @close="showModal = false"
              />
            </section>
          </div>
        </div>
      </div>

      <div
        v-if="showModal && formQuestions.length > 0"
        class="modal"
        :class="{ 'is-active': showModal }"
        data-cy="form-assignment-modal"
        v-esc="() => (closeFormRequest += 1)"
      >
        <div class="modal-background"></div>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">Compose Email</p>
            <button
              class="delete"
              aria-label="close"
              @click="closeFormRequest += 1"
            ></button>
          </header>
          <section class="modal-card-body">
            <JSONForm
              v-if="showModal"
              :init-schema="formQuestions"
              :init-value="{}"
              :read-only="false"
              :showSaveButton="false"
              :close-request="closeFormRequest"
              @submitted="submitEmail($event)"
              @close="showModal = false"
            />
            <div class="email-preview">TODO: a preview?</div>
          </section>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { computed, onUnmounted, ref } from "vue";
import { useStore } from "vuex";

import fb from "@/firebase.js";
import formAssignmentUtils from "@/utils/formAssignment";
import { esc } from "@/directives/escape";

import JSONForm from "@/components/form/JSONForm.vue";
import Loading from "@/components/Loading.vue";

export default {
  components: {
    JSONForm,
    Loading,
  },
  directives: {
    ...esc,
  },
  setup() {
    const emails = ref([]);
    const showModal = ref(false);
    const loading = ref(true);
    const closeFormRequest = ref(0);

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
      emails.value.filter(tabs[selectedTab.value])
    );

    const unsubEmails = fb.db.collection("emails").onSnapshot((snapshot) => {
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
            "HTML body of the email to send (e.g. `<p>Hello <a href='earth.google.com'>World</a></p>`).  See preview below.",
          model: "body",
          required: true,
        },
      ];
    });

    const submitEmail = async ({
      target_groups,
      target_organizations,
      target_users,
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
        users.value
      );

      try {
        await fb.createEmail({
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

    return {
      closeFormRequest,
      formQuestions,
      loading,
      selectedEmails,
      selectedTab,
      showModal,
      submitEmail,
      tabs,
    };
  },
};
</script>
