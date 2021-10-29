<template>
  <div class="nested-schema">
    <SchemaForm :schema="schema" />
    Value: {{ value }}
  </div>
</template>

<script>
import { useSchemaForm, SchemaFormFactory } from "formvuelate";
import VeeValidatePlugin from "@formvuelate/plugin-vee-validate";
import { ref, toRefs, watch } from "vue";
import { cloneDeep } from "@/utils/utils";

const factory = SchemaFormFactory([VeeValidatePlugin()]);

export default {
  components: { SchemaForm: factory },
  props: {
    modelValue: {
      type: Object,
      default: () => {},
    },
    initSchema: {
      type: Array,
      required: true,
    },
  },
  setup(props, { emit }) {
    const { modelValue, initSchema } = toRefs(props);

    const schema = ref(cloneDeep(initSchema.value));
    const value = ref(cloneDeep(modelValue.value));
    useSchemaForm(value);

    watch(
      () => value.value,
      () => {
        emit("updateModelValue", value);
      },
      { deep: true }
    );

    return {
      value,
      schema,
    };
  },
};
</script>

<style lang="scss" scoped>
.nested-schema {
  border-style: solid;
  border-color: grey;
  border-width: 1px;
  padding: 20px;
  border-radius: 6px;
}
</style>
