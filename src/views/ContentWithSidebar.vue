<template>
  <div :class="['snack-area', sidebarCollapsed ? 'collapsed' : '']">
    <Sidebar
      :pages="pages"
      :parentRoute="parentRoute"
      :class="['sidebar', sidebarCollapsed ? 'collapsed' : '']"
      @toggle="sidebarCollapsed = !sidebarCollapsed"
    />
    <div class="snack-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { onMounted, onUnmounted, ref, toRefs, watch } from "vue";
import { useStore } from "vuex";

import fb from "@/firebase.js";

import Sidebar from "@/components/Sidebar";
import { useMobileListener } from "@/composables/useMobileListener";

export default {
  components: {
    Sidebar,
  },
  props: {
    parentRoute: {
      type: String,
      required: true,
    },
    pages: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  setup(props) {
    const { parentRoute } = toRefs(props);
    const { isMobile } = useMobileListener();
    const sidebarCollapsed = ref(false);
    let unsubUsers = null;

    const store = useStore();

    if (isMobile.value) {
      sidebarCollapsed.value = true;
    }

    watch(isMobile, () => {
      sidebarCollapsed.value = isMobile.value;
    });

    const updateStore = () => {
      if (parentRoute.value === "admin") {
        unsubUsers = fb.db.collection("users").onSnapshot((snapshot) => {
          store.dispatch(
            "updateUsers",
            snapshot.docs.map((doc) => {
              let user = doc.data();
              return { ...user, id: doc.id };
            })
          );
        });

        store.dispatch("getFormAssignments");
      }
    };

    onMounted(updateStore);
    watch(parentRoute, updateStore);

    // unsubscribe when leaving this page
    onUnmounted(() => {
      if (unsubUsers !== null) unsubUsers();
    });

    return {
      sidebarCollapsed,
    };
  },
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
