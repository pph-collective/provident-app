<template>
  <div class="container is-static is-fluid">
    <div class="only-printed">
      <h2 class="is-size-2">{{ formTitle }}</h2>
      <p>Last updated: {{ lastUpdatedValue }}</p>
      <hr />
    </div>
    <fieldset :disabled="readOnly">
      <SchemaForm :schema="schema" @submit="$emit('submitted', value)">
        <template v-slot:afterForm>
          <div class="sticky-bottom">
            <div
              v-if="!readOnly"
              class="field is-grouped is-grouped-centered mb-1"
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
            <p class="has-text-centered" data-cy="form-message">
              <small>{{ formMessage }}</small>
            </p>
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
    lastUpdated: {
      type: Number,
      required: false,
      default: undefined,
    },
    formTitle: {
      type: String,
      required: false,
      default: "",
    },
    formMessage: {
      type: String,
      required: false,
      default: "",
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

    const lastUpdatedValue = computed(() => {
      if (formUpdated.value) {
        return new Date().toLocaleString();
      } else {
        return props.lastUpdated
          ? new Date(props.lastUpdated).toLocaleString()
          : "N/A";
      }
    });

    return {
      value,
      schema,
      cloneDeep,
      formUpdated,
      lastUpdatedValue,
    };
  },
};
</script>

<style lang="scss">
// This style element isn't scoped because the following styles affects those within the SchemaForm component which
// would be out of scope.

@import "@/assets/styles/main.scss";

.schema-row {
  margin-bottom: #{$block-spacing};
}
</style>

<style lang="scss" scoped>
@import "@/assets/styles/main.scss";

.only-printed {
  display: none;
}

@media print {
  .only-printed {
    display: inline;
  }
}

.is-static {
  position: static;
}

.sticky-bottom {
  position: sticky;
  bottom: -20px;
  padding: 16px 0;
  margin-bottom: -20px; /* modal-card-body is relative and has padding */
  margin-left: -52px;
  margin-right: -52px;
  background-color: $light;
  border-top: solid hsl(0deg 0% 86%) 1px;

  @include mobile {
    margin-left: -20px;
    margin-right: -20px;
  }
}
</style>
