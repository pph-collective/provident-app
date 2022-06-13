<template>
  <Loading :loading="!user.loaded" />
  <div class="container is-fullhd">
    <div class="panel is-primary m-4 has-background-white" data-cy="form-panel">
      <p class="panel-heading" data-cy="form-panel-heading">Forms</p>

      <div class="p-2">
        <button
          class="button is-primary is-small"
          @click="showFilters = !showFilters"
        >
          {{ showFilters ? "Hide" : "Show" }} Filters
        </button>
      </div>

      <div
        v-if="showFilters"
        class="panel-block pt-0 is-flex-wrap-wrap is-justify-content-space-around"
      >
        <div
          v-for="(options, filterName) in filterOptions"
          :key="'filter-' + filterName"
          class="column py-0 filter-field"
        >
          <label>
            {{ filterName }}
            <Multiselect
              mode="tags"
              v-model="filters[filterName]"
              :options="options"
              :searchable="false"
              :close-on-select="true"
              :hide-selected="false"
            >
              <template v-slot:tag="{ option, handleTagRemove, disabled }">
                <div class="multiselect-tag is-flex">
                  <span class="is-flex-shrink-1 shorten-ellipsis">
                    {{ option.label }}
                  </span>
                  <span
                    v-if="!disabled"
                    class="multiselect-tag-remove"
                    @mousedown.prevent="handleTagRemove(option, $event)"
                  >
                    <span class="multiselect-tag-remove-icon"></span>
                  </span>
                </div>
              </template>
            </Multiselect>
          </label>
        </div>
      </div>
      <div v-else class="panel-block p-0" />

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

          <div class="level-right has-text-centered is-flex-shrink-1 mt-0">
            <div class="panel-tags">
              <PanelTag
                v-if="formResponse.form.type === 'organization'"
                label="organization-level"
              />
              <PanelTag
                v-if="user.admin && formResponse.release_date"
                :class="{
                  'is-success is-light': formResponse.release_date <= today,
                }"
                label="release date"
                :value="formResponse.release_date"
              />
              <PanelTag
                v-if="formResponse.response[MUNI_QUESTION_MODEL]"
                label="municipality"
                :value="formResponse.response[MUNI_QUESTION_MODEL]"
              />
              <PanelTag
                v-if="formResponse.response[GEOID_QUESTION_MODEL]"
                label="block group"
                :value="formResponse.response[GEOID_QUESTION_MODEL]"
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
              <PanelTag
                v-if="formResponse.status !== 'Not Started'"
                :label="
                  formResponse.status === 'Draft' ? 'last updated' : 'submitted'
                "
                :value="
                  new Date(formResponse.last_updated).toISOString().slice(0, 10)
                "
              />
              <PanelTag
                v-if="formResponse.user_submitted"
                label="SUBMITTED BY"
                :value="formResponse.user_submitted"
              />
            </div>
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

<script setup>
import { reactive, ref, computed } from "vue";
import { useStore } from "vuex";
import Multiselect from "@vueform/multiselect";

import utils, {
  GEOID_QUESTION_MODEL,
  MUNI_QUESTION_MODEL,
  sortByProperty,
  uniqueArray,
} from "@/utils/utils.js";
import fb from "@/firebase.js";

import FormModal from "@/components/form/Modal.vue";
import Loading from "@/components/Loading.vue";
import PanelTag from "@/components/PanelTag.vue";

const store = useStore();
const user = computed(() => store.state.user);
const userRole = computed(() =>
  user.value.data ? user.value.data.role : "user"
);

const formResponses = computed(() => {
  let responses = [...store.state.user.formResponses];
  if (!user.value.admin) {
    responses = responses.filter((f) => {
      return f.release_date <= today;
    });
  }

  return responses
    .sort(sortByProperty("last_update"))
    .sort(sortByProperty("status"));
});
const activeFormResponse = ref({});

const filterFields = [
  "Form Title",
  "Organization Level?",
  "Status",
  "Municipality",
  "Block Group",
];
const filters = reactive(
  filterFields.reduce((acc, v) => {
    acc[v] = [];
    return acc;
  }, {})
);
const showFilters = ref(true);

const filterOptions = computed(() => {
  return {
    "Form Title": uniqueArray(formResponses.value.map((f) => f.form.title)),
    "Organization Level?": ["Yes", "No"],
    Status: ["Not Started", "Draft", "Submitted"],
    Municipality: uniqueArray(
      formResponses.value
        .filter((f) => f.response[MUNI_QUESTION_MODEL])
        .map((f) => f.response[MUNI_QUESTION_MODEL])
    ),
    "Block Group": uniqueArray(
      formResponses.value
        .filter((f) => f.response[GEOID_QUESTION_MODEL])
        .map((f) => f.response[GEOID_QUESTION_MODEL])
    ),
  };
});

const filterFunctions = {
  "Form Title": (formResponse) =>
    filters["Form Title"].includes(formResponse.form.title),
  "Organization Level?": (formResponse) =>
    (filters["Organization Level?"].includes("Yes") &&
      formResponse.form.type === "organization") ||
    (filters["Organization Level?"].includes("No") &&
      formResponse.form.type === "user"),
  Status: (formResponse) => filters.Status.includes(formResponse.status),
  Municipality: (formResponse) =>
    filters.Municipality.includes(formResponse.response[MUNI_QUESTION_MODEL]),
  "Block Group": (formResponse) =>
    filters["Block Group"].includes(
      formResponse.response[GEOID_QUESTION_MODEL]
    ),
};

const selectedFormResponses = computed(() => {
  let res = formResponses.value;
  for (const filterField of filterFields) {
    if (filters[filterField].length > 0) {
      res = res.filter(filterFunctions[filterField]);
    }
  }
  return res;
});

const today = utils.today();

const launchForm = (formResponse) => {
  activeFormResponse.value = formResponse;
  fb.logActivity(user.value.data.email, "launch form", formResponse._id);
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/main.scss";

.form-row {
  width: 100%;
}
.filter-field {
  min-width: 220px;
  max-width: 25rem;
}
.panel-tags {
  padding: 0 0.75rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;

  @include mobile {
    justify-content: center;
  }
}
</style>
