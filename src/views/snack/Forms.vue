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
                    <span class="multiselect-tag-remove-icon" />
                  </span>
                </div>
              </template>
            </Multiselect>
          </label>
        </div>
      </div>
      <div v-else class="panel-block p-0" />

      <FormsPanel
        :selected-form-responses="selectedFormResponses"
        :read-only="false"
        @launch-form="launchForm"
        @review-form="reviewForm"
      />
    </div>
  </div>

  <FormModal
    :form-response="activeFormResponse"
    :read-only="activeFormReadOnly"
    @update-form-response="activeFormResponse = $event"
  />
</template>

<script>
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
import FormsPanel from "@/components/FormsPanel.vue";
import Loading from "@/components/Loading.vue";

export default {
  components: {
    FormModal,
    FormsPanel,
    Loading,
    Multiselect,
  },
  setup() {
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
    const activeFormReadOnly = ref(true);

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
        filters.Municipality.includes(
          formResponse.response[MUNI_QUESTION_MODEL]
        ),
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
      activeFormReadOnly.value = false;
      activeFormResponse.value = formResponse;
      fb.logActivity(user.value.data.email, "launch form", formResponse._id);
    };

    const reviewForm = (formResponse) => {
      activeFormReadOnly.value = true;
      activeFormResponse.value = formResponse;
      fb.logActivity(user.value.data.email, "review form", formResponse._id);
    };

    return {
      GEOID_QUESTION_MODEL,
      MUNI_QUESTION_MODEL,
      activeFormReadOnly,
      activeFormResponse,
      filters,
      filterOptions,
      launchForm,
      reviewForm,
      selectedFormResponses,
      showFilters,
      today,
      user,
      userRole,
    };
  },
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
