<template>
  <div class="field">
    <label class="label" :for="uuid">{{ label }}</label>
    <p v-if="help_text" class="help">{{ help_text }}</p>
    <div class="control" :id="uuid">
      <div v-for="(value, index) in modelValue" :key="index">
        Index: {{ index }}
        <NestedSchema
          :model-value="value"
          :init-schema="questions"
          @update-model-value="updateValue($event, index)"
        />
      </div>
      Model Value: {{ modelValue }}

      <button type="button" class="button is-link" @click="pushValue">
        + Task
      </button>
    </div>
  </div>
</template>

<script>
import NestedSchema from "./NestedSchema";
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
    validation: {
      type: Object,
      default: () => ({}),
    },
  },
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

    return {
      pushValue,
      updateValue,
      value,
    };
  },
};
</script>

<style lang="scss" scoped>
.control {
  border-style: solid;
  border-color: grey;
  border-width: 1px;
  padding: 20px;
  border-radius: 6px;
}
</style>
