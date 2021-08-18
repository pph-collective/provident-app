<template>
  <div
    class="dashboard-card-container"
    :class="['is-' + width, 'is-height-' + height]"
  >
    <header v-if="!noHeader" class="dashboard-card-header">
      <div
        class="
          is-flex
          is-flex-direction-row
          is-justify-content-space-between
          is-flex-wrap-wrap
          fullwidth
        "
      >
        <h2 class="title mb-3"><slot name="title"></slot></h2>
        <div><slot name="top-right"></slot></div>
      </div>
      <h3 class="subtitle is-family-secondary">
        <slot name="subtitle"></slot>
      </h3>
    </header>
    <section class="dashboard-card-content is-family-secondary">
      <slot name="content"></slot>
    </section>
  </div>
</template>

<script>
export default {
  props: {
    width: {
      type: String,
      default: "full",
    },
    height: {
      type: Number,
      default: 2,
    },
    noHeader: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style lang="scss" scoped>
@import "bulma";

.dashboard-card-container {
  margin-bottom: 0 !important;
  @extend .box;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  overflow-x: visible;
}
.dashboard-card-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  @extend .px-4;
  @extend .py-4;
  width: 100%;
}
.title {
  min-width: 200px;
}
.dashboard-card-content {
  padding: 0;
  width: 100%;
}
.fullwidth {
  width: 100%;
}
.is-one-third {
  grid-column-start: span 2;
  @include mobile {
    grid-column-start: span 1;
  }
}
.is-half {
  grid-column-start: span 3;
  @include mobile {
    grid-column-start: span 1;
  }
}
.is-full {
  grid-column-start: span 6;
  @include mobile {
    grid-column-start: span 1;
  }
}
.is-two-thirds {
  grid-column-start: span 4;
  @include mobile {
    grid-column-start: span 1;
  }
}
.is-height-1 {
  grid-row-start: span 1;
}
.is-height-2 {
  grid-row-start: span 2;
}
.is-height-3 {
  grid-row-start: span 3;
}
.is-height-4 {
  grid-row-start: span 4;
}
.is-height-5 {
  grid-row-start: span 5;
}
.is-height-6 {
  grid-row-start: span 6;
}
</style>
