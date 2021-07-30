<template>
  <div class="p-2">
    <div class="has-text-right">
      <button type="button" class="button is-text bars" @click="toggle">
        <i v-if="!collapsed" class="fas fa-chevron-left" />
        <i v-else class="fas fa-chevron-right" />
      </button>
    </div>
    <div class="sidebar-body">
      <p v-if="!collapsed" class="menu-label">Provident</p>
      <p v-else class="menu-label">
        <abbr title="Exploration Datasets">PRV</abbr>
      </p>
      <ul class="menu-list">
        <li v-for="item in pages" :key="item.route">
          <router-link
            :class="{ 'is-active': route === item.route }"
            :to="`/snack/${item.route}`"
          >
            <span v-if="!collapsed">
              <i :class="['fas', item.icon, 'mr-1']" />{{ item.name }}</span
            >
            <span v-else
              ><abbr :title="item.name" class="collapsed-flex-item">
                <i :class="['fas', item.icon, 'mr-1']" />
                <span>{{ getInitials(item.name) }}</span>
              </abbr></span
            >
          </router-link>
        </li>
      </ul>

      <p v-if="!collapsed" class="menu-label">Resources</p>
      <p v-else class="menu-label">
        <abbr title="Resources">RSC</abbr>
      </p>
      <ul class="menu-list">
        <li>
          <a
            href="https://preventoverdoseri.org"
            onclick="return confirm('Are you sure you want to leave Provident?')"
          >
            <span v-if="!collapsed">
              <i class="fas fa-prescription-bottle mr-1" />
              Prevent Overdose RI</span
            >
            <span v-else>
              <abbr title="Prevent Overdose RI" class="collapsed-flex-item">
                <i class="fas fa-database mr-1" />
                <span> PORI</span>
              </abbr></span
            >
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { useRoute } from "vue-router";
import { ref, watch } from "vue";
import { useMobileListener } from "@/composables/useMobileListener";

export default {
  emits: ["toggle"],
  setup(_, { emit }) {
    const { isMobile } = useMobileListener();
    const collapsed = ref(false);
    if (isMobile.value) {
      collapsed.value = true;
    }

    watch(isMobile, () => {
      collapsed.value = isMobile.value;
    });

    const pages = [
      {
        name: "Dashboard",
        route: "dashboard",
        icon: "fa-chart-line",
      },
      {
        name: "Forms",
        route: "forms",
        icon: "fa-file-alt",
      },
    ];

    const route = useRoute();

    const toggle = () => {
      collapsed.value = !collapsed.value;
      return emit("toggle", collapsed.value);
    };

    const getInitials = (str) => {
      return str
        .split(" ")
        .map((s) => s[0].toUpperCase())
        .join("");
    };

    return {
      collapsed,
      pages,
      route,
      toggle,
      getInitials,
    };
  },
};
</script>

<style lang="scss" scoped>
.is-active {
  background-color: $primary !important;
}
.not-allowed-cursor {
  cursor: not-allowed;
}
.bars {
  border: none !important;
  background-color: whitesmoke !important;
}
.collapsed-flex-item {
  display: flex;
  align-items: center;
  justify-items: center;
  margin-left: -0.35rem;
  span {
    font-size: 0.6rem;
  }
}
</style>
