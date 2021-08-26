<template>
  <div class="field">
    <label class="label" :for="uuid">{{ label }}</label>
    <p v-if="helpText" class="help">{{ helpText }}</p>
    <div class="control">
      <div class="is-fullwidth is-family-secondary">
        <Multiselect
          :mode="multiple ? 'tags' : 'single'"
          :modelValue="modelValue"
          :required="required"
          :id="uuid"
          :options="options"
          :searchable="true"
          @change="$emit('update:modelValue', $event)"
        >
        </Multiselect>
        <span>Selected: {{ modelValue }}</span>
      </div>
      <span class="has-text-danger is-size-7">{{
        validation.errorMessage
      }}</span>
    </div>
  </div>
</template>

<script>
import { onMounted, toRefs } from "vue";
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
    helpText: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      default: "text",
    },
    uuid: {
      type: Number,
      default: 0,
    },
    placeholder: {
      default: "",
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
  },
  setup(props, { emit }) {
    const { multiple, modelValue } = toRefs(props);

    onMounted(() => {
      // Initialize modelValue
      if (modelValue.value === undefined) {
        emit("update:modelValue", multiple.value ? [] : "");
      }
    });
  },
};
</script>

<style lang="scss">
@import "@vueform/multiselect/themes/default.scss";

:root {
  --ms-tag-bg: #{$primary};
  --ms-tag-radius: #{$radius};

  --ms-ring-color: #{$primary};
  --ms-ring-width: 1px;

  --ms-option-bg-selected: #{$primary};
  --ms-option-bg-selected-pointed: #{$link};
}
</style>
