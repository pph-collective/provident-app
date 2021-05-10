<template>
  <div class="field">
    <label class="label" :for="uuid">{{ label }}</label>
    <div class="control" :id="uuid">
      <label v-for="(option, i) in options" :key="'option-' + i">
        <input
          type="radio"
          :name="uuid"
          :value="modelValue"
          :required="required"
          @input="$emit('update:modelValue', option)"
        />
        {{ option }}
      </label>
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
    uuid: {
      type: Number,
      default: 0
    },
    options: {
      type: Array,
      required: true
    }
  }
};
</script>
