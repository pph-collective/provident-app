<template>
  <div :class="['snack-area', sidebarCollapsed ? 'collapsed' : '']">
    <Sidebar class="sidebar" @toggle="sidebarCollapsed = !sidebarCollapsed" />
    <div class="snack-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";

import Sidebar from "@/components/Sidebar";

export default {
  components: {
    Sidebar
  },
  setup() {
    const sidebarCollapsed = ref(false);

    return {
      sidebarCollapsed
    };
  }
};
</script>

<style lang="scss" scoped>
.sidebar {
  grid-area: sidebar;
  border-right: 1px solid #a4b1bf;
}

.snack-content {
  grid-area: snack-content;
  min-height: 90vh;
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
}
</style>
