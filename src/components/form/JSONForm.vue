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
                v-if="showAltButton"
                type="button"
                class="button is-info"
                :disabled="!formUpdated"
                @click="$emit('alt', cloneDeep(value))"
              >
                {{ altButtonLabel }}
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
import { computed, ref, watch } from "vue";
import { onBeforeRouteLeave } from "vue-router";
import { cloneDeep, evalSchema } from "@/utils/utils";

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
      required: false,
      default: false,
    },
    initValue: {
      type: Object,
      required: false,
      default() {
        return {};
      },
    },
    closeRequest: {
      type: Number,
      required: true,
    },
    showAltButton: {
      type: Boolean,
      default: true,
    },
    altButtonLabel: {
      type: String,
      default: "Save",
    },
  },
  emits: ["alt", "submitted", "close"],
  setup(props, { emit }) {
    const value = ref(cloneDeep(props.initValue));
    useSchemaForm(value);

    const schema = ref(cloneDeep(props.initSchema));
    evalSchema(schema.value, yup);

    const formUpdated = computed(
      () =>
        JSON.stringify({ ...props.initValue }) !== JSON.stringify(value.value)
    );

    const closeDialog =
      "Are you sure you want to close the form? You have unsaved changes.";

    // watches for changes in the closeRequest prop treating a change as an event trigger
    // alerts the user if they have unsaved changes before continuing to close
    // emits a close event to close the form
    watch(
      () => props.closeRequest,
      () => {
        if (formUpdated.value) {
          const answer = window.confirm(closeDialog);
          if (answer) {
            emit("close");
          }
        } else {
          emit("close");
        }
      }
    );

    onBeforeRouteLeave((to, from, next) => {
      if (formUpdated.value) {
        const answer = window.confirm(closeDialog);
        if (answer) {
          next();
        } else {
          next(false);
        }
      }
    });

    return {
      value,
      schema,
      cloneDeep,
      formUpdated,
    };
  },
};
</script>

<style lang="scss">
// This style element isn't scoped because the following styles affects those within the SchemaForm component which
// would be out of scope.

@import "bulma";

.schema-row {
  margin-bottom: #{$block-spacing};
}
</style>
