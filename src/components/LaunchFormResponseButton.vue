<template>
  <button
    v-if="
      !readOnly &&
      formResponse.status !== 'Submitted' &&
      (formResponse.form.type === 'user' ||
        (formResponse.form.type === 'organization' && userRole === 'champion'))
    "
    class="button is-primary level-item"
    data-cy="launch-form-button"
    type="button"
    @click="onClick(formResponse, false)"
  >
    {{ formResponse.status === "Draft" ? "Continue" : "Start" }}
  </button>
  <button
    v-else
    class="button is-primary is-light level-item"
    data-cy="review-form-button"
    type="button"
    @click="onClick(formResponse, true)"
  >
    Review Form
  </button>
</template>

<script setup lang="ts">
import { withDefaults } from "vue";

type Form = {
  _id: string;
  questions: object;
  title: string;
  type: "organization" | "user";
};

type FormResponse = {
  expire_date: string;
  form: Form;
  form_assignment_id: string;
  last_updated: number;
  organization: string;
  release_date: string;
  response: {
    bg_id: string;
    municipality: string;
  };
  status: string;
  user_submitted: string;
  user_edited: string[];
};

withDefaults(
  defineProps<{
    onClick: (formResponse: FormResponse, readOnly: boolean) => void;
    formResponse: FormResponse;
    userRole: string;
    readOnly?: boolean;
  }>(),
  {
    readOnly: false,
  },
);
</script>

<style lang="scss" scoped></style>
