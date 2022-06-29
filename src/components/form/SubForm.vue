<template>
  <div class="field">
    <div :id="uuid" class="control">
      <div v-for="(subValue, index) in modelValue" :key="index">
        <div
          class="is-flex is-justify-content-space-between is-align-items-center"
        >
          <label class="label" :for="uuid">{{ label }}</label>
          <button
            v-if="!read_only && repeat_button_title"
            class="button is-link is-inverted"
            data-cy="delete-sub-form-button"
            :disabled="modelValue.length === 1"
            @click="deleteValue(index)"
          >
            <i class="fas fa-trash" />
          </button>
        </div>
        <p v-if="help_text" class="help">
          {{ help_text }}
        </p>
        <NestedSchema
          :model-value="subValue"
          :init-schema="questions"
          :read-only="read_only"
          @update-model-value="updateValue($event, index)"
        />
      </div>
      <div class="has-text-centered">
        <button
          v-if="repeat_button_title"
          type="button"
          class="button is-link"
          data-cy="sub-form-button"
          :disabled="read_only"
          @click="pushValue"
        >
          {{ repeat_button_title }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import NestedSchema from "./NestedSchema.vue";
import { cloneDeep } from "@/utils/utils";
import { ref, toRefs } from "vue";

export default {
  components: {
    NestedSchema,
  },
  props: {
    modelValue: {
      type: Array,
      default: () => [{}],
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
    questions: {
      type: Array,
      required: true,
    },
    // eslint-disable-next-line vue/prop-name-casing
    repeat_button_title: {
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
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const { modelValue } = toRefs(props);
    const value = ref(cloneDeep(modelValue.value));

    const updateValue = (updatedValue, index) => {
      value.value[index] = updatedValue;
      emit("update:modelValue", value.value);
    };

    const pushValue = () => {
      value.value.push({});
      emit("update:modelValue", value.value);
    };

    const deleteValue = (index) => {
      if (value.value.length > 1) {
        value.value.splice(index, 1);
        emit("update:modelValue", value.value);
      }
    };

    return {
      deleteValue,
      pushValue,
      updateValue,
      value,
    };
  },
};
</script>
