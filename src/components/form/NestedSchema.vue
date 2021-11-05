<template>
  <div class="nested-schema">
    <SchemaForm :schema="schema" :initial-values="value" />
  </div>
</template>

<script>
import { useSchemaForm, SchemaFormFactory } from "formvuelate";
import VeeValidatePlugin from "@formvuelate/plugin-vee-validate";
import * as yup from "yup";
import { ref, toRefs, watch } from "vue";
import { cloneDeep, evalSchema } from "@/utils/utils";

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

    const value = ref(cloneDeep(modelValue.value));
    useSchemaForm(value);

    const schema = ref(cloneDeep(initSchema.value));
    evalSchema(schema.value, yup);

    watch(
      value,
      () => {
        emit("updateModelValue", value.value);
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
  margin: 20px 0px;
  border-radius: 6px;
}
</style>
