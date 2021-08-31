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
            {{ forms[formResponse.form_id].title }}
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
              {{ formResponse.status === "Draft" ? "Continue" : "Start" }}
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

  <FormModal
    :form-response="activeFormResponse"
    :form="activeForm"
    @update-form-response="activeFormResponse = $event"
  />
</template>

<script>
import { ref, computed } from "vue";
import { useStore } from "vuex";
import FormModal from "@/components/form/Modal.vue";

export default {
  components: {
    FormModal,
  },
  setup() {
    const store = useStore();
    const user = computed(() => store.state.user);
    const userRole = computed(() =>
      user.value.data ? user.value.data.role : "user"
    );
    const formResponses = computed(() => {
      if (!user.value.admin) {
        return user.value.formResponses.filter((f) => {
          return f.release_date <= today;
        });
      }

      return user.value.formResponses;
    });

    const forms = computed(() => store.state.forms);
    const activeFormResponse = ref({});
    const tabs = ref(["To Do", "All", "Submitted", "Organization-level"]);
    const selectedTab = ref("To Do");
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

    let today = new Date(); // Local time
    today = today.toISOString().split("T")[0]; // Date to ISO string without time

    const activeForm = computed(() => {
      const formId = activeFormResponse.value.form_id;

      if (formId) {
        return forms.value[formId];
      }

      return {};
    });

    return {
      selectedFormResponses,
      activeFormResponse,
      tabs,
      selectedTab,
      activeForm,
      today,
      forms,
      formResponses,
      user,
      userRole,
    };
  },
};
</script>

<style lang="scss" scoped>
.form-row {
  width: 100%;
}
</style>
