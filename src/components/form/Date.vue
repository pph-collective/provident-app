<template>
  <div class="field">
    <label class="label" :for="uuid">{{ label }}</label>
    <p v-if="help_text" class="help">
      {{ help_text }}
    </p>
    <div class="control">
      <input
        :id="uuid"
        class="input"
        type="date"
        :min="min_date === 'today' ? today : min_date"
        :max="max_date === 'today' ? today : max_date"
        :value="modelValue"
        :required="required"
        :disabled="read_only"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <span class="has-text-danger is-size-7">{{
        validation.errorMessage
      }}</span>
    </div>
  </div>
</template>

<script>
import utils from "@/utils/utils";

export default {
  props: {
    modelValue: { required: true },
    required: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      required: true,
    },
    help_text: {
      type: String,
      default: "",
    },
    uuid: {
      type: Number,
      default: 0,
    },
    validation: {
      type: Object,
      default: () => ({}),
    },
    min_date: {
      // "today" or an ISO date string like "2020-08-26"
      type: String,
      default: "",
    },
    max_date: {
      type: String,
      default: "",
    },
    read_only: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue"],
  setup() {
    const today = utils.today(); // Date to ISO string without time

    return {
      today,
    };
  },
};
</script>
