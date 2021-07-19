<template>
  <div class="container is-fluid">
    <fieldset :disabled="readOnly">
      <SchemaForm :schema="schema" @submit="$emit('submitted', value)">
        <template v-slot:afterForm>
          <div
            v-if="!readOnly"
            class="field is-grouped is-grouped-centered my-3"
          >
            <div class="control">
              <button type="submit" class="button is-link">Submit</button>
            </div>
            <div class="control">
              <button
                type="button"
                class="button is-info"
                :disabled="JSON.stringify(initValue) === JSON.stringify(value)"
                @click="$emit('save', value)"
              >
                Save
              </button>
            </div>
            <div class="control">
              <button
                type="button"
                class="button is-link is-light"
                @click="$emit('cancel')"
              >
                Cancel
              </button>
            </div>
          </div>
        </template>
      </SchemaForm>
    </fieldset>
  </div>
</template>

<script>
import { SchemaFormFactory, useSchemaForm } from "formvuelate";
import VeeValidatePlugin from "@formvuelate/plugin-vee-validate";
import * as yup from "yup";
import { ref } from "vue";

// form components declared globally in main.js

// Declare form components as local components
const factory = SchemaFormFactory([VeeValidatePlugin()]);

export default {
  components: { SchemaForm: factory },
  props: {
    initSchema: {
      type: Array,
      required: true,
    },
    readOnly: {
      type: Boolean,
      requred: false,
      default: false,
    },
    initValue: {
      type: Object,
      required: false,
      default() {
        return {};
      },
    },
  },
  emits: ["cancel", "save", "submitted"],
  setup(props) {
    const value = ref({ ...props.initValue });
    useSchemaForm(value);

    const schema = ref([...props.initSchema]);

    // evaluate strings that are really methods
    const evalSchema = (s, yup) => {
      s.forEach((q) => {
        for (const key in q) {
          if (["condition", "validations"].includes(key)) {
            q[key] = eval(q[key]);
          } else if (key === "component" && !q[key].startsWith("Form")) {
            q[key] = "Form" + q[key];
          } else if (q[key] !== null && typeof q[key] === "object") {
            // should never get hit, but need this to keep yup available (should be a better way...)
            evalSchema(q[key], yup);
          }
        }
      });
    };
    evalSchema(schema.value, yup);

    return {
      value,
      schema,
    };
  },
};
</script>
