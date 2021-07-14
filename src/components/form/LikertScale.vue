<template>
  <div class="field">
    <label class="label">{{ label }}</label>
    <div v-for="(statement, i) in statements" :key="'statement-' + i">
      <p :for="uuid">{{ statement }}</p>
      <div class="control" :id="uuid">
        <label
          v-for="(option, i) in options"
          :key="'option-' + i"
          class="radio"
        >
          <input
            type="radio"
            :name="uuid"
            :value="modelValue"
            :required="required"
            :checked="modelValue === option"
            @input="$emit('update:modelValue', option)"
          />
          {{ option }}
        </label>
        <span class="has-text-danger is-size-7">{{
          validation.errorMessage
        }}</span>
      </div>
    </div>
  </div>

  <div class="field">
    <label class="label">{{ label }}</label>
    <table class="table">
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
          <td v-for="(option, i) in options" :key="'options-' + i">
            <input type="radio" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  props: {
    modelValue: { required: true },
    required: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      required: true
    },
    uuid: {
      type: Number,
      default: 0
    },
    options: {
      type: Array,
      default: () => {
        return [
          "Strongly disagree",
          "Disagree",
          "Neutral",
          "Agree",
          "Strongly Agree",
          "N/A"
        ];
      },
      required: false
    },
    validation: {
      type: Object,
      default: () => ({})
    }
  },
  setup() {
    const statements = [
      "It is easy to get sterile needles in this census tract",
      "It is easy to get new works (like cookers, cottons, sterile water) in this census tract",
      "It is easy to get naloxone in this census tract",
      "It is easy to get access to healthcare in this census tract (low cost clinic, ED, free clinic)",
      "It is easy to get to a licensed clinic for methadone in this census tract",
      "It is easy to get to a licensed provider for buprenorphine in this census tract"
    ];

    return {
      statements
    };
  }
};
</script>
