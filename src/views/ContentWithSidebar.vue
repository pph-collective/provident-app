<template>
  <div :class="['snack-area', sidebarCollapsed ? 'collapsed' : '']">
    <BaseSidebar
      :pages="pages"
      :parent-route="parentRoute"
      :class="['sidebar', sidebarCollapsed ? 'collapsed' : '']"
      @toggle="sidebarCollapsed = !sidebarCollapsed"
    />
    <div class="snack-content">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, ref, toRefs, watch } from "vue";

import BaseSidebar from "../components/BaseSidebar.vue";
import { useMobileListener } from "../composables/useMobileListener";

const props = withDefaults(
  defineProps<{
    parentRoute: string;
    pages: string[];
  }>(),
  {
    pages: () => [],
  },
);

const { parentRoute } = toRefs(props);
const { isMobile } = useMobileListener();
const sidebarCollapsed = ref(false);
let unsubUsers = null;

if (isMobile.value) {
  sidebarCollapsed.value = true;
}

watch(isMobile, () => {
  sidebarCollapsed.value = isMobile.value;
});

// unsubscribe when leaving this page
onUnmounted(() => {
  if (unsubUsers !== null) unsubUsers();
});
</script>

<style lang="scss" scoped>
@import "@/assets/styles/main.scss";

.sidebar {
  background-color: whitesmoke;
  grid-area: sidebar;
  border-right: 1px solid #a4b1bf;

  @include mobile {
    grid-area: sidebar-start / sidebar-start / sidebar-end / overlap-end;
    z-index: 10;

    &.collapsed {
      grid-area: sidebar;
    }
  }
}

.snack-content {
  grid-area: snack-content;
  min-height: 90vh;

  @include mobile {
    grid-area: overlap-start / overlap-start / overlap-end / snack-content-end;
  }
}

.snack-area {
  border-top: 1px solid #a4b1bf;
  background-color: whitesmoke;
  display: grid;
  grid-template-columns: minmax(250px, 1fr) 4fr;
  grid-template-areas: "sidebar snack-content";

  &.collapsed {
    grid-template-columns: 7ch auto;
  }

  @include mobile {
    grid-template-columns: 7ch 220px auto;
    grid-template-areas: "sidebar overlap snack-content";

    &.collapsed {
      grid-template-columns: 7ch 220px auto;
    }
  }
}
</style>
