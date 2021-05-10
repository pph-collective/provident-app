<template>
  <div class="field">
    <label class="label" :for="uuid">{{ label }}</label>
    <div class="control">
      <textarea
        class="textarea"
        :value="modelValue"
        :required="required"
        :id="uuid"
        :placeholder="placeholder"
        @input="$emit('update:modelValue', $event.target.value)"
      />
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
    placeholder: {
      default: ""
    }
  }
};
</script>
