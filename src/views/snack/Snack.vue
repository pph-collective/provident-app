<template>
  <div :class="['snack-area', sidebarCollapsed ? 'collapsed' : '']">
    <Sidebar
      :class="['sidebar', sidebarCollapsed ? 'collapsed' : '']"
      @toggle="sidebarCollapsed = !sidebarCollapsed"
    />
    <div class="snack-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { ref, watch } from "vue";

import Sidebar from "@/components/Sidebar";
import { useMobileListener } from "@/composables/useMobileListener";

export default {
  components: {
    Sidebar
  },
  setup() {
    const { isMobile } = useMobileListener();
    let sidebarCollapsed = ref(false);

    if (isMobile.value) {
      sidebarCollapsed = ref(true);
    }

    watch(
      () => isMobile.value,
      () => {
        if (isMobile.value) {
          sidebarCollapsed.value = true;
        }
      }
    );

    return {
      sidebarCollapsed
    };
  }
};
</script>

<style lang="scss" scoped>
@import "bulma";

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
