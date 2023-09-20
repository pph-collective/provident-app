<template>
  <div class="field">
    <label class="label" :for="uuid">{{ label }}</label>
    <p v-if="help_text" class="help">
      {{ help_text }}
    </p>
    <div class="control">
      <textarea
        :id="uuid"
        class="textarea"
        :value="modelValue"
        :required="required"
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

<script setup>
defineProps({
  modelValue: {
    type: [String, undefined],
    default: undefined,
  },
  required: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    required: true,
  },
  // eslint-disable-next-line vue/prop-name-casing
  help_text: {
    type: String,
    default: "",
  },
  uuid: {
    type: Number,
    default: 0,
  },
  placeholder: {
    type: String,
    default: "",
  },
  validation: {
    type: Object,
    default: () => ({}),
  },
  // eslint-disable-next-line vue/prop-name-casing
  read_only: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["update:modelValue"]);
</script>
