<template>
  <div
    class="dashboard-card-container"
    :class="['is-' + width, 'is-height-' + height]"
  >
    <header v-if="!noHeader" class="dashboard-card-header my-3">
      <div
        class="is-flex is-flex-direction-row is-justify-content-space-between is-flex-wrap-wrap fullwidth"
      >
        <h2 v-if="$slots.title" class="title mb-3">
          <slot name="title" />
        </h2>
        <div><slot name="top-right" /></div>
      </div>
      <h3 v-if="$slots.subtitle" class="subtitle is-family-secondary">
        <slot name="subtitle" />
      </h3>
    </header>
    <section
      v-if="$slots.content"
      class="dashboard-card-content is-family-secondary my-3"
    >
      <slot name="content" />
    </section>
  </div>
</template>

<script setup>
defineProps({
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
});
</script>

<style lang="scss" scoped>
@import "@/assets/styles/main.scss";

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
  @extend .px-0;
  @extend .py-0;
  width: 100%;
}
.title {
  min-width: 200px;
}
.dashboard-card-content {
  padding: 0;
  width: 100%;
  height: 100%;
}
.fullwidth {
  width: 100%;
}
.is-one-third {
  grid-column-start: span 2;
  @include touch {
    grid-column-start: span 1;
  }
}
.is-half {
  grid-column-start: span 3;
  @include mobile {
    grid-column-start: span 1;
  }
  @include tablet-only {
    grid-column-start: span 2;
  }
}
.is-full {
  grid-column-start: span 6;
  @include mobile {
    grid-column-start: span 1;
  }
  @include tablet-only {
    grid-column-start: span 2;
  }
}
.is-two-thirds {
  grid-column-start: span 4;
  @include mobile {
    grid-column-start: span 1;
  }
  @include tablet-only {
    grid-column-start: span 2;
  }
}
.is-height-1 {
  grid-row-start: span 1;
  @include desktop {
    min-height: 5vh;
  }
}
.is-height-2 {
  grid-row-start: span 2;
  @include desktop {
    min-height: 30vh;
  }
}
.is-height-3 {
  grid-row-start: span 3;
  @include desktop {
    min-height: 45vh;
  }
}
.is-height-4 {
  grid-row-start: span 4;
  @include desktop {
    min-height: 60vh;
  }
}
.is-height-5 {
  grid-row-start: span 5;
  @include desktop {
    min-height: 75vh;
  }
}
.is-height-6 {
  grid-row-start: span 6;
  @include desktop {
    min-height: 90vh;
  }
}
</style>
