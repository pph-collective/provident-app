<template>
  <div class="field">
    <label class="label" :for="uuid">{{ label }}</label>
    <p v-if="helpText" class="help">{{ helpText }}</p>
    <div class="control">
      <input
        class="input"
        type="date"
        :min="minDate === 'today' ? today : minDate"
        :max="maxDate"
        :value="modelValue"
        :required="required"
        :id="uuid"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <span>Model Value: {{ modelValue }}</span>
      <span class="has-text-danger is-size-7">{{
        validation.errorMessage
      }}</span>
    </div>
  </div>
</template>

<script>
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
    helpText: {
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
    minToday: {
      type: Boolean,
      default: false,
    },
    minDate: {
      // "today" or an ISO date string like "2020-08-26"
      type: String,
      default: "",
    },
    maxDate: {
      type: String,
      default: "",
    },
  },
  setup() {
    let today = new Date(); // Local time
    today = today.toISOString().split("T")[0]; // Date to ISO string without time

    return {
      today,
    };
  },
};
</script>
