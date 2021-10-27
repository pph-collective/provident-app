<template>
  <div class="field">
    <label class="label" :for="uuid">{{ label }}</label>
    <p v-if="help_text" class="help">{{ help_text }}</p>
    <div class="control" :id="uuid">
      <SchemaForm :schema="schema" />
    </div>
  </div>
</template>

<script>
import { SchemaFormFactory } from "formvuelate";
import VeeValidatePlugin from "@formvuelate/plugin-vee-validate";

const factory = SchemaFormFactory([VeeValidatePlugin()]);

export default {
  components: { SchemaForm: factory },
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
    schema: {
      type: Array,
      required: true,
    },
    validation: {
      type: Object,
      default: () => ({}),
    },
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
