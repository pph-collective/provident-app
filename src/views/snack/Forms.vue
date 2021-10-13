<template>
  <Loading :loading="!user.loaded" />
  <div class="container is-fullhd">
    <div class="panel is-primary m-4 has-background-white" data-cy="form-panel">
      <p class="panel-heading" data-cy="form-panel-heading">Forms</p>

      <div class="panel-tabs" data-cy="panel-tabs">
        <a
          v-for="tab in Object.keys(tabs)"
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
              {{ formResponse.form.title }}
            </p>
          </div>

          <div class="level-right has-text-centered">
            <PanelTag
              v-if="formResponse.form.type === 'organization'"
              label="organization-level"
            />
            <PanelTag
              v-if="user.admin"
              :class="{
                'is-success is-light': formResponse.release_date <= today,
              }"
              label="release date"
              :value="formResponse.release_date"
            />
            <PanelTag
              :class="{
                'is-warning': formResponse.status === 'Not Started',
                'is-info': formResponse.status === 'Draft',
                'is-success': formResponse.status === 'Submitted',
              }"
              label="status"
              :value="formResponse.status"
            />
            <div class="level-item">
              <button
                v-if="
                  formResponse.status !== 'Submitted' &&
                  (formResponse.form.type === 'user' ||
                    (formResponse.form.type === 'organization' &&
                      userRole === 'champion'))
                "
                class="button is-primary level-item"
                data-cy="launch-form-button"
                type="button"
                @click="launchForm(formResponse)"
              >
                {{ formResponse.status === "Draft" ? "Continue" : "Start" }}
              </button>
              <button
                v-else
                class="button is-primary is-light level-item"
                data-cy="review-form-button"
                type="button"
                @click="launchForm(formResponse)"
              >
                Review Form
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <FormModal
    :form-response="activeFormResponse"
    @update-form-response="activeFormResponse = $event"
  />
</template>

<script>
import { ref, computed } from "vue";
import { useStore } from "vuex";

import utils from "@/utils/utils.js";
import fb from "@/firebase.js";

import FormModal from "@/components/form/Modal.vue";
import Loading from "@/components/Loading.vue";
import PanelTag from "@/components/PanelTag.vue";

export default {
  components: {
    FormModal,
    Loading,
    PanelTag,
  },
  setup() {
    const store = useStore();
    const user = computed(() => store.state.user);
    const userRole = computed(() =>
      user.value.data ? user.value.data.role : "user"
    );
    const formResponses = computed(() => {
      if (!user.value.admin) {
        return store.state.user.formResponses.filter((f) => {
          return f.release_date <= today;
        });
      }

      return store.state.user.formResponses;
    });
    const activeFormResponse = ref({});
    const tabs = {
      "To Do": (formResponse) =>
        formResponse.status !== "Submitted" &&
        (formResponse.form.type === "user" ||
          (formResponse.form.type === "organization" &&
            userRole.value === "champion")),
      All: () => true,
      Submitted: (formResponse) => formResponse.status === "Submitted",
      "Organization-level": (formResponse) =>
        formResponse.form.type === "organization",
    };
    const selectedTab = ref(Object.keys(tabs)[0]);
    const selectedFormResponses = computed(() =>
      formResponses.value.filter(tabs[selectedTab.value])
    );

    const today = utils.today();

    const launchForm = (formResponse) => {
      activeFormResponse.value = formResponse;
      fb.logActivity(user.value.data.email, "launch form", formResponse._id);
    };

    return {
      selectedFormResponses,
      activeFormResponse,
      tabs,
      selectedTab,
      today,
      formResponses,
      launchForm,
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
