<template>
  <div class="field">
    <label class="label" :for="uuid">{{ label }}</label>
    <p v-if="help_text" class="help">
      {{ help_text }}
    </p>
    <div :id="uuid" class="control">
      <label v-for="(option, i) in options" :key="'option-' + i" class="radio">
        <input
          type="radio"
          :name="uuid"
          :value="modelValue"
          :required="required"
          :checked="modelValue === option"
          :disabled="read_only"
          @input="$emit('update:modelValue', option)"
        />
        {{ option }}
      </label>
      <span class="has-text-danger is-size-7">{{
        validation.errorMessage
      }}</span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    modelValue: {
      type: String,
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
    options: {
      type: Array,
      required: true,
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
  },
  emits: ["update:modelValue"],
};
</script>
