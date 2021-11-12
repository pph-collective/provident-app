<template>
  <div class="field">
    <label class="label" :for="uuid">{{ label }}</label>
    <p v-if="help_text" class="help">{{ help_text }}</p>
    <div class="control">
      <textarea
        class="textarea"
        :value="modelValue"
        :required="required"
        :id="uuid"
        :placeholder="placeholder"
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
    placeholder: {
      default: "",
    },
    validation: {
      type: Object,
      default: () => ({}),
    },
    read_only: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
