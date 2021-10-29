<template>
  <div class="field">
    <label class="label" :for="uuid">{{ label }}</label>
    <p v-if="help_text" class="help">{{ help_text }}</p>
    <div class="control" :id="uuid">
      <SchemaForm :schema="questions" />

      Model Value: {{ modelValue }} Value: {{ formModel }}
    </div>
  </div>
</template>

<script>
import { useSchemaForm, SchemaFormFactory } from "formvuelate";
import VeeValidatePlugin from "@formvuelate/plugin-vee-validate";
import { ref, watch } from "vue";
import { cloneDeep } from "@/utils/utils";

const factory = SchemaFormFactory([VeeValidatePlugin()]);

export default {
  components: { SchemaForm: factory },
  props: {
    modelValue: {
      type: Object,
      default: () => {},
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
    const formModel = ref(
      props.modelValue !== undefined ? cloneDeep(props.modelValue) : {}
    );
    useSchemaForm(formModel);

    watch(
      () => formModel.value,
      () => {
        emit("update:modelValue", formModel);
      },
      { deep: true }
    );

    return {
      formModel,
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
