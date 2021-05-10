<template>
  <div class="container is-fluid">
    <SchemaForm @submit="submitForm" :schema="schema">
      <template v-slot:afterForm>
        <div class="field is-grouped is-grouped-centered my-3">
          <div class="control">
            <button type="submit" class="button is-link">Submit</button>
          </div>
          <div class="control">
            <button type="button" class="button is-info" @click="saveForm">
              Save
            </button>
          </div>
          <div class="control">
            <button
              type="button"
              class="button is-link is-light"
              @click="cancelForm"
            >
              Cancel
            </button>
          </div>
        </div>
      </template>
    </SchemaForm>
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
    schema: {
      type: Object,
      required: true
    }
  },
  setup() {
    const value = ref({});
    useSchemaForm(value);

    const submitForm = () => {
      console.log(value.value);
    };

    const saveForm = () => {
      console.log("save!");
    };

    const cancelForm = () => {
      console.log("cancel!");
    };

    return {
      value,
      submitForm,
      saveForm,
      cancelForm
    };
  }
};
</script>
