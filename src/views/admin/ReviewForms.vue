<template>
  <Loading :loading="!user.loaded" />

  <FormsPanel
    title="Review Forms"
    :admin="true"
    :filter-options="filterOptions"
    :filter-functions="filterFunctions"
    :form-responses="formResponses"
    :read-only="true"
  />
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";

import {
  GEOID_QUESTION_MODEL,
  MUNI_QUESTION_MODEL,
  sortByProperty,
  uniqueArray,
} from "@/utils/utils.js";

import Loading from "@/components/Loading.vue";
import FormsPanel from "@/components/FormsPanel.vue";

const store = useStore();
const user = computed(() => store.state.user);

const organizationOptions = store.getters.formOrganizationOptions;

const formResponses = computed(() => {
  return [...store.state.allFormResponses]
    .sort(sortByProperty("last_updated"))
    .sort(sortByProperty("status"));
});

const filterOptions = computed(() => {
  return {
    "Form Title": uniqueArray(formResponses.value.map((f) => f.form.title)),
    Organization: organizationOptions.filter((org) =>
      formResponses.value.find((f) => f.organization === org)
    ),
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
  Organization: (formResponse, filterValue) =>
    filterValue.includes(formResponse.organization),
  Status: (formResponse, filterValue) =>
    filterValue.includes(formResponse.status),
  Municipality: (formResponse, filterValue) =>
    filterValue.includes(formResponse.response[MUNI_QUESTION_MODEL]),
  "Block Group": (formResponse, filterValue) =>
    filterValue.includes(formResponse.response[GEOID_QUESTION_MODEL]),
};
</script>
