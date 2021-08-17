<template>
  <div class="panel is-primary m-4 has-background-white" data-cy="form-panel">
    <p class="panel-heading" data-cy="form-panel-heading">Forms</p>

    <div class="panel-tabs" data-cy="panel-tabs">
      <a
        v-for="tab in tabs"
        :key="tab"
        :class="selectedTab === tab ? 'is-active' : ''"
        @click="selectedTab = tab"
        >{{ tab }}</a
      >
    </div>

    <div
      v-if="selectedFormResponses.length === 0"
      data-cy="forms-panel-block"
      class="panel-block is-justify-content-center"
    >
      <span>No forms here</span>
    </div>
    <div
      v-else
      data-cy="forms-panel-block"
      v-for="(formResponse, idx) in selectedFormResponses"
      :key="'formResponse-' + idx"
      class="panel-block"
    >
      <div class="level form-row" data-cy="form-row">
        <div class="level-left">
          <p class="level-item is-size-5" data-cy="form-title">
            {{ formResponse.title }}
          </p>
        </div>

        <div class="level-right has-text-centered">
          <span
            v-if="formResponse.type === 'organization'"
            class="level-item tag"
            data-cy="organization-level-tag"
          >
            <p><strong>Organization-level</strong></p>
          </span>
          <span
            v-if="user.admin"
            class="level-item tag"
            :class="{
              'is-success is-light': formResponse.release_date <= today,
            }"
            data-cy="release-date-tag"
          >
            <p>
              <strong>RELEASE DATE:</strong> {{ formResponse.release_date }}
            </p>
          </span>
          <span
            class="level-item tag is-light"
            :class="{
              'is-warning': formResponse.status === 'Not Started',
              'is-info': formResponse.status === 'Draft',
              'is-success': formResponse.status === 'Submitted',
            }"
            data-cy="status-tag"
          >
            <p><strong>STATUS:</strong> {{ formResponse.status }}</p>
          </span>
          <div class="level-item">
            <button
              v-if="
                formResponse.status !== 'Submitted' &&
                (formResponse.type === 'user' ||
                  (formResponse.type === 'organization' &&
                    userRole === 'champion'))
              "
              class="button is-primary level-item"
              data-cy="launch-form-button"
              type="button"
              @click="activeFormResponse = formResponse"
            >
              Launch Form
            </button>
            <button
              v-else
              class="button is-primary is-light level-item"
              data-cy="review-form-button"
              type="button"
              @click="activeFormResponse = formResponse"
            >
              Review Form
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <teleport to="body">
    <div v-esc="() => (closeFormRequest += 1)">
      <div
        v-if="'form_id' in activeFormResponse"
        class="modal is-active"
        data-cy="active-form-modal"
      >
        <div class="modal-background"></div>
        <div class="modal-card is-family-secondary">
          <header class="modal-card-head">
            <p class="modal-card-title" data-cy="active-form-title">
              {{ activeFormResponse.title }}
            </p>
            <button
              class="delete"
              data-cy="close-form"
              aria-label="close"
              @click="closeFormRequest += 1"
            ></button>
          </header>
          <section class="modal-card-body" data-cy="form-body">
            <JSONForm
              :init-schema="activeFormQuestions"
              :read-only="
                activeFormResponse.status === 'Submitted' ||
                (activeFormResponse.type === 'organization' &&
                  userRole !== 'champion')
              "
              :init-value="activeFormResponse.response"
              :close-request="closeFormRequest"
              @save="updateFormResponse($event, 'Draft')"
              @submitted="updateFormResponse($event, 'Submitted')"
              @close="activeFormResponse = {}"
            />
            <p
              v-if="formMessage"
              class="has-text-centered"
              data-cy="form-message"
            >
              <small>{{ formMessage }}</small>
            </p>
          </section>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
import { onMounted, ref, computed } from "vue";
import { useStore } from "vuex";

import fb from "@/firebase";
import { esc } from "@/directives/escape";
import JSONForm from "@/components/form/JSONForm.vue";

export default {
  components: {
    JSONForm,
  },
  directives: {
    ...esc,
  },
  setup() {
    const forms = ref({});
    const formResponses = ref([]);
    const activeFormResponse = ref({});
    const tabs = ref(["To Do", "All", "Submitted", "Organization-level"]);
    const selectedTab = ref("To Do");
    const formMessage = ref("");

    const closeFormRequest = ref(0);

    const selectedFormResponses = computed(() => {
      if (selectedTab.value === "All") return formResponses.value;

      return formResponses.value.filter((formResponse) => {
        if (
          selectedTab.value === "To Do" &&
          formResponse.status !== "Submitted" &&
          (formResponse.type === "user" ||
            (formResponse.type === "organization" &&
              userRole.value === "champion"))
        ) {
          return true;
        } else if (
          selectedTab.value === "Submitted" &&
          formResponse.status === "Submitted"
        ) {
          return true;
        } else if (
          selectedTab.value === "Organization-level" &&
          formResponse.type === "organization"
        ) {
          return true;
        }

        return false;
      });
    });

    const store = useStore();
    const user = computed(() => store.state.user);
    const userEmail = computed(() =>
      user.value.data ? user.value.data.email : ""
    );
    const organization = computed(() =>
      user.value.data ? user.value.data.organization : ""
    );
    const userRole = computed(() =>
      user.value.data ? user.value.data.role : "user"
    );

    let today = new Date(); // Local time
    today = today.toISOString().split("T")[0]; // Date to ISO string without time

    onMounted(async () => {
      forms.value = await fb.getForms();
      if (!user.value.admin) {
        forms.value = forms.value.filter((f) => {
          return f.release_date <= today;
        });
      }
      formResponses.value = await fb.getFormResponses(
        userEmail.value,
        organization.value
      );
    });

    const activeFormQuestions = computed(() => {
      const formId = activeFormResponse.value.form_id;

      if (formId) {
        const form = forms.value[formId];

        if (form) {
          return form.questions;
        }
      }

      return [];
    });

    const updateFormResponse = async (response, status) => {
      let users_edited = activeFormResponse.value.users_edited ?? [];
      if (!users_edited.includes(userEmail.value)) {
        users_edited.push(userEmail.value);
      }

      const updateData = {
        response,
        users_edited,
        user_submitted: status === "Submitted" ? userEmail.value : "",
        last_updated: Date.now(),
        status,
      };

      const updatedFormResponse = {
        ...activeFormResponse.value,
        ...updateData,
      };

      const success = await fb.updateFormResponse(
        userEmail.value,
        organization.value,
        updatedFormResponse
      );

      if (success) {
        formMessage.value = "Form successfully saved";

        // update formResponses
        const formResponseIndex = formResponses.value.findIndex(
          (formResponse) =>
            formResponse._id === activeFormResponse.value._id &&
            formResponse.type === activeFormResponse.value.type
        );

        formResponses.value[formResponseIndex] = updatedFormResponse;

        // update activeFormResponse
        if (status === "Submitted") {
          activeFormResponse.value = {};
        } else {
          activeFormResponse.value = updatedFormResponse;
        }
      } else {
        formMessage.value = "Error saving form";
      }

      // show the message only for 6 seconds
      setTimeout(() => (formMessage.value = ""), 6000);
    };

    return {
      selectedFormResponses,
      activeFormResponse,
      tabs,
      selectedTab,
      activeFormQuestions,
      updateFormResponse,
      formMessage,
      today,
      formResponses,
      user,
      userRole,
      closeFormRequest,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "bulma";

.form-row {
  width: 100%;
}

.modal-card-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: calc(100% - 40px);
}

@include mobile {
  .modal-card {
    max-height: 100vh;
  }

  /* Reduce the padding when on mobile */
  .modal-card-body {
    padding: 10px;
  }

  .modal .container {
    padding-left: 10px;
    padding-right: 10px;
  }
}
</style>
