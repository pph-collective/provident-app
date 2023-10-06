<template>
  <div class="nested-schema">
    <fieldset :disabled="readOnly">
      <SchemaForm :schema="schema" :initial-values="value" />
    </fieldset>
  </div>
</template>

<script setup>
import { useSchemaForm, SchemaFormFactory } from "formvuelate";
import VeeValidatePlugin from "@formvuelate/plugin-vee-validate";
import * as yup from "yup";
import { ref, watch } from "vue";
import { cloneDeep, evalSchema } from "@/utils/utils";

const SchemaForm = SchemaFormFactory([VeeValidatePlugin()]);

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  initSchema: {
    type: Array,
    required: true,
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["updateModelValue"]);

const value = ref(cloneDeep(props.modelValue));
useSchemaForm(value);

const schema = ref(cloneDeep(props.initSchema));
evalSchema(schema.value, yup);
schema.value.forEach((q) => {
  if (typeof q.read_only === "function") {
    q.read_only = q.read_only(props.modelValue);
  }
});

watch(
  value,
  () => {
    emit("updateModelValue", value.value);
  },
  { deep: true }
);
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
