<template>
  <div class="control-panel box">
    <div
      v-for="(options, type) in dropDowns"
      class="control-panel-dropdown control has-icons-left"
      :key="'control-panel-dropdown-' + type"
    >
      <span class="select">
        <select
          @input="$emit('selected', { type, value: $event.target.value })"
        >
          <option
            v-for="(option, index) in options.values"
            :key="'option-' + index"
            >{{ option }}</option
          >
        </select>
      </span>
      <span class="icon is-small is-left pl-1">
        <i :class="options.icon"></i>
      </span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    dropDowns: {
      type: Object,
      required: true
    }
  },
  emits: ["selected"]
};
</script>

<style lang="scss" scoped>
.control-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  grid-gap: 1rem;
  justify-items: center;
}
.control-panel-dropdown {
  width: 100%;
  max-width: 400px;
  .select,
  select {
    width: 100%;
  }
}
</style>
