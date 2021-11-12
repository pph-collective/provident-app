<template>
  <div class="field">
    <label class="label" :for="uuid">{{ label }}</label>
    <p v-if="help_text" class="help">{{ help_text }}</p>
    <div class="control">
      <div class="is-fullwidth is-family-secondary">
        <Multiselect
          :mode="multiple ? 'tags' : 'single'"
          :modelValue="modelValue"
          :required="required"
          :id="uuid"
          :options="options"
          :searchable="true"
          :disabled="read_only"
          @change="$emit('update:modelValue', $event)"
        >
        </Multiselect>
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
    read_only: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
