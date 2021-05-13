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
              <button type="submit" class="button is-link">
                Submit
              </button>
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
import { ref, markRaw } from "vue";

// import form components
import TextInput from "@/components/form/TextInput";
markRaw(TextInput);

import TextArea from "@/components/form/TextArea";
markRaw(TextArea);

import Select from "@/components/form/Select";
markRaw(Select);

import Radio from "@/components/form/Radio";
markRaw(Radio);

// Declare form components as local components
const factory = SchemaFormFactory([], { TextInput, TextArea, Select, Radio });

export default {
  components: { SchemaForm: factory },
  props: {
    initSchema: {
      type: Object,
      required: true
    },
    readOnly: {
      type: Boolean,
      requred: false,
      default: false
    },
    initValue: {
      type: Object,
      required: false,
      default() {
        return {};
      }
    }
  },
  emits: ["cancel", "save", "submitted"],
  setup(props) {
    const value = ref({ ...props.initValue });
    useSchemaForm(value);

    const schema = { ...props.initSchema };

    const evalConditions = o => {
      console.log(o);
      for (const key in o) {
        if (key === "condition") {
          o[key] = eval(o[key]);
        } else if (o[key] !== null && typeof o[key] === "object") {
          //going one step down in the object tree!!
          evalConditions(o[key]);
        }
      }
    };
    evalConditions(schema);

    return {
      value,
      schema
    };
  }
};
</script>
