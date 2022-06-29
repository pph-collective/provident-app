<template>
  <div class="field">
    <label class="label" :for="uuid">{{ label }}</label>
    <p v-if="help_text" class="help">
      {{ help_text }}
    </p>
    <div class="control">
      <div class="is-fullwidth is-family-secondary">
        <Multiselect
          :id="uuid"
          :mode="multiple ? 'tags' : 'single'"
          :model-value="modelValue"
          :required="required"
          :options="options"
          :searchable="true"
          :disabled="read_only"
          @change="$emit('update:modelValue', $event)"
        />
      </div>
      <span class="has-text-danger is-size-7">{{
        validation.errorMessage
      }}</span>
    </div>
  </div>
</template>

<script>
import Multiselect from "@vueform/multiselect";

export default {
  components: {
    Multiselect,
  },
  props: {
    modelValue: {
      type: [String, Object, undefined],
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
    multiple: {
      type: Boolean,
      default: false,
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
