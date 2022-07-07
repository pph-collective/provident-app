<template>
  <div class="container is-fullhd">
    <div class="panel is-primary m-4 has-background-white" data-cy="form-panel">
      <p class="panel-heading" data-cy="form-panel-heading">{{ title }}</p>

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
              v-model="filters[filterName]"
              mode="tags"
              :options="options"
              :searchable="false"
              :close-on-select="true"
              :hide-selected="false"
            >
              <template #tag="{ option, handleTagRemove, disabled }">
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
        v-for="(formResponse, idx) in selectedFormResponses"
        v-else
        :key="'formResponse-' + idx"
        data-cy="forms-panel-block"
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
                v-if="readOnly && formResponse.organization"
                label="ORGANIZATION"
                :value="formResponse.organization"
              />
              <PanelTag
                v-if="readOnly && formResponse.user"
                label="USER"
                :value="formResponse.user"
              />
              <PanelTag
                v-if="!readOnly && formResponse.form.type === 'organization'"
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
                label="last updated"
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
                  !readOnly &&
                  formResponse.status !== 'Submitted' &&
                  (formResponse.form.type === 'user' ||
                    (formResponse.form.type === 'organization' &&
                      userRole === 'champion'))
                "
                class="button is-primary level-item"
                data-cy="launch-form-button"
                type="button"
                @click="launchForm(formResponse, false)"
              >
                {{ formResponse.status === "Draft" ? "Continue" : "Start" }}
              </button>
              <button
                v-else
                class="button is-primary is-light level-item"
                data-cy="review-form-button"
                type="button"
                @click="launchForm(formResponse, true)"
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
    :read-only="activeFormReadOnly"
    @update-form-response="activeFormResponse = $event"
  />
</template>

<script setup lang="ts">
import { reactive, ref, computed } from "vue";
import { useStore } from "vuex";
import Multiselect from "@vueform/multiselect";

import fb from "../firebase.js";
import FormModal from "./form/Modal.vue";
import PanelTag from "./PanelTag.vue";
import utils, {
  GEOID_QUESTION_MODEL,
  MUNI_QUESTION_MODEL,
} from "../utils/utils.js";

const props = withDefaults(
  defineProps<{
    filterOptions: object;
    filterFunctions: object;
    formResponses: object[];
    title: string;
    readOnly: boolean;
  }>(),
  {
    filterOptions: () => ({}),
    filterFunctions: () => ({}),
    formResponses: () => [],
    title: "",
  }
);

const activeFormResponse = ref({});
const activeFormReadOnly = ref(true);

const store = useStore();
const user = computed(() => store.state.user);
const userRole = computed(() =>
  user.value.data ? user.value.data.role : "user"
);

const today = utils.today();

const filters = reactive(
  Object.keys(props.filterOptions).reduce((acc, v) => {
    acc[v] = [];
    return acc;
  }, {})
);

const showFilters = ref(true);

const selectedFormResponses = computed(() => {
  let res = props.formResponses;
  for (const filterField of Object.keys(props.filterOptions)) {
    if (filters[filterField].length > 0) {
      res = res.filter((formResponse) =>
        props.filterFunctions[filterField](formResponse, filters[filterField])
      );
    }
  }
  return res;
});

const launchForm = (formResponse, readOnly) => {
  activeFormReadOnly.value = readOnly;
  activeFormResponse.value = formResponse;
  fb.logActivity(
    user.value.data.email,
    readOnly ? "review form" : "launch form",
    formResponse._id
  );
};
</script>

<style lang="scss" scoped>
@import "../assets/styles/main.scss";

.form-row {
  width: 100%;
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
