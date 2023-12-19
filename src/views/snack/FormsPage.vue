<template>
  <LoadingSpinner :loading="!user.loaded" />

  <FormsPanel
    title="Forms"
    :filter-options="filterOptions"
    :filter-functions="filterFunctions"
    :form-responses="formResponses"
    :read-only="false"
  />
</template>

<script setup>
import { computed } from "vue";
import { useProvidentStore } from "../../store";

import utils, {
  GEOID_QUESTION_MODEL,
  MUNI_QUESTION_MODEL,
  sortByProperty,
  uniqueArray,
} from "@/utils/utils.js";

import FormsPanel from "@/components/FormsPanel.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";

const store = useProvidentStore();
const user = computed(() => store.user);

const today = utils.today();
const formResponses = computed(() => {
  let responses = [...store.user.formResponses];
  if (!user.value.admin) {
    responses = responses.filter((f) => {
      return f.release_date <= today;
    });
  }

  return responses
    .sort(sortByProperty("last_update"))
    .sort(sortByProperty("status"));
});

const filterOptions = computed(() => {
  return {
    "Form Title": uniqueArray(formResponses.value.map((f) => f.form.title)),
    Status: ["Not Started", "Draft", "Submitted"],
    Municipality: uniqueArray(
      formResponses.value
        .filter((f) => f.response[MUNI_QUESTION_MODEL])
        .map((f) => f.response[MUNI_QUESTION_MODEL]),
    ),
    "Block Group": uniqueArray(
      formResponses.value
        .filter((f) => f.response[GEOID_QUESTION_MODEL])
        .map((f) => f.response[GEOID_QUESTION_MODEL]),
    ),
  };
});

const filterFunctions = {
  "Form Title": (formResponse, filterValue) =>
    filterValue.includes(formResponse.form.title),
  Status: (formResponse, filterValue) =>
    filterValue.includes(formResponse.status),
  Municipality: (formResponse, filterValue) =>
    filterValue.includes(formResponse.response[MUNI_QUESTION_MODEL]),
  "Block Group": (formResponse, filterValue) =>
    filterValue.includes(formResponse.response[GEOID_QUESTION_MODEL]),
};
</script>
