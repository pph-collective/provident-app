<template>
  <div class="field">
    <label class="label">{{ label }}</label>
    <div class="b-table">
      <div class="table-wrapper has-mobile-cards">
        <table class="table is-fullwidth is-striped is-fullwidth">
          <thead>
            <tr>
              <th></th>
              <th v-for="(option, i) in options" :key="'options-' + i">
                {{ option }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(statement, i) in statements" :key="'statements-' + i">
              <th>{{ statement }}</th>
              <td
                v-for="(option, j) in options"
                :key="'options-' + j"
                :data-label="option"
                @click.self="checkRadio($event, modelValue)"
              >
                <!--
                Radio Button
                name: All radio buttons that share the same name and are controls in the same form are part of a group
                id: The id of each radio button is unique
                data-key: statement key for the modelValue
                value: statement value for the modelValue
                -->
                <input
                  type="radio"
                  :name="`${uuid}-statements-${i}`"
                  :id="`${uuid}-statements-${i}-${j}`"
                  :data-key="`statements-${i}`"
                  :value="option"
                  :checked="
                    modelValue
                      ? modelValue[`statements-${i}`] === option
                      : false
                  "
                  :required="required"
                  @input="updateValue($event.target, modelValue)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
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
    uuid: {
      type: Number,
      default: 0,
    },
    options: {
      type: Array,
      default: () => {
        return [
          "Strongly Disagree",
          "Disagree",
          "Neutral",
          "Agree",
          "Strongly Agree",
          "N/A",
        ];
      },
      required: false,
    },
    statements: {
      type: Array,
      required: true,
    },
    validation: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(_, { emit }) {
    const checkRadio = (event, modelValue) => {
      const fieldset = event.target.closest("fieldset");
      if (!fieldset.disabled) {
        const radioButton = event.target.querySelector("input[type=radio]");
        radioButton.checked = true;

        updateValue(radioButton, modelValue);
      }
    };

    const updateValue = (radioButton, modelValue) => {
      let result = modelValue ?? {};
      result[radioButton.getAttribute("data-key")] = radioButton.value;
      emit("update:modelValue", result);
    };

    return {
      checkRadio,
      updateValue,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "bulma-responsive-tables";
</style>
