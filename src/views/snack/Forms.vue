<template>
  <Loading :loading="!user.loaded" />

  <FormsPanel
    :filter-options="filterOptions"
    :filter-functions="filterFunctions"
    :form-responses="formResponses"
    :read-only="false"
    @launch-form="launchForm"
    @review-form="reviewForm"
  />

  <FormModal
    :form-response="activeFormResponse"
    :read-only="activeFormReadOnly"
    @update-form-response="activeFormResponse = $event"
  />
</template>

<script>
import { ref, computed } from "vue";
import { useStore } from "vuex";

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
  },
  setup() {
    const store = useStore();
    const user = computed(() => store.state.user);
    const userRole = computed(() =>
      user.value.data ? user.value.data.role : "user"
    );

    const today = utils.today();
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
      "Form Title": (formResponse, filterValue) =>
        filterValue.includes(formResponse.form.title),
      "Organization Level?": (formResponse, filterValue) =>
        (filterValue.includes("Yes") &&
          formResponse.form.type === "organization") ||
        (filterValue.includes("No") && formResponse.form.type === "user"),
      Status: (formResponse, filterValue) =>
        filterValue.includes(formResponse.status),
      Municipality: (formResponse, filterValue) =>
        filterValue.includes(formResponse.response[MUNI_QUESTION_MODEL]),
      "Block Group": (formResponse, filterValue) =>
        filterValue.includes(formResponse.response[GEOID_QUESTION_MODEL]),
    };

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
      filterFunctions,
      filterOptions,
      formResponses,
      launchForm,
      reviewForm,
      user,
      userRole,
    };
  },
};
</script>
