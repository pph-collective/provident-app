<template>
  <div class="field">
    <label class="label" :for="uuid">{{ label }}</label>
    <div class="control">
      <div class="select">
        <select
          :value="modelValue"
          :required="required"
          :id="uuid"
          @input="$emit('update:modelValue', $event.target.value)"
        >
          <option v-for="(option, i) in options" :key="'option-' + i">{{
            option
          }}</option>
        </select>
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
      default: false
    },
    label: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: "text"
    },
    uuid: {
      type: Number,
      default: 0
    },
    placeholder: {
      default: ""
    },
    options: {
      type: Array,
      required: true
    }
  }
};
</script>
