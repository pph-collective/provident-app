<template>
  <div class="field">
    <label class="label" :for="uuid">{{ label }}</label>
    <p v-if="help_text" class="help">
      {{ help_text }}
    </p>
    <div class="control">
      <ul class="is-flex-direction-column is-flex-wrap-wrap">
        <li v-for="(option, i) in options" :key="'option-' + i">
          <label>
            <input
              type="checkbox"
              :name="uuid"
              :value="option"
              :checked="modelValue ? modelValue.includes(option) : false"
              :disabled="read_only"
              @input="updateValue($event, modelValue)"
            />
            {{ option }}
          </label>
        </li>
      </ul>
      <span class="has-text-danger is-size-7">
        {{ validation.errorMessage }}
      </span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    modelValue: {
      type: [Array, undefined],
      default: undefined,
    },
    required: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      required: true,
    },
    // eslint-disable-next-line vue/prop-name-casing
    help_text: {
      type: String,
      default: "",
    },
    uuid: {
      type: Number,
      default: 0,
    },
    options: {
      type: Array,
      required: true,
    },
    validation: {
      type: Object,
      default: () => ({}),
    },
    // eslint-disable-next-line vue/prop-name-casing
    read_only: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue"],
  setup(_, { emit }) {
    const updateValue = (event, modelValue) => {
      let selected = modelValue ? [...modelValue] : [];

      if (event.target.checked) {
        selected.push(event.target.value);
      } else {
        selected = selected.filter((v) => v !== event.target.value);
      }

      emit("update:modelValue", selected);
    };

    return {
      updateValue,
    };
  },
};
</script>

<style lang="scss" scoped>
ul {
  column-width: 200px;
}

li {
  // Hanging indent
  text-indent: -1em;
  margin: 0.33em 0.5em 0.5em 1.5em;

  break-inside: avoid-column;
}
</style>
