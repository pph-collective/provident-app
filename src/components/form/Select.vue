<template>
  <div class="field">
    <label class="label" :for="uuid">{{ label }}</label>
    <div class="control">
      <div class="select is-fullwidth" :class="multiple ? 'is-multiple' : ''">
        <select
          :multiple="multiple"
          :required="required"
          :id="uuid"
          @input="updateValue($event.target)"
        >
          <option v-if="!multiple" :disabled="required" selected></option>
          <option
            v-for="(option, i) in options"
            :key="'option-' + i"
            :selected="isSelected(option, modelValue)"
          >
            {{ option }}
          </option>
        </select>
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
    const { multiple } = toRefs(props);

    onMounted(() => {
      emit("update:modelValue", multiple.value ? [] : "");
    });

    const updateValue = (target) => {
      if (multiple.value) {
        const result = [...target.selectedOptions].map((o) => o.value);
        emit("update:modelValue", result);
      } else {
        emit("update:modelValue", target.value);
      }
    };

    const isSelected = (option, modelValue) => {
      if (multiple.value) {
        return modelValue === undefined ? false : modelValue.includes(option);
      } else {
        return option === modelValue;
      }
    };

    return {
      updateValue,
      isSelected,
    };
  },
};
</script>
