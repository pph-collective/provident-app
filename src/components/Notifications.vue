<template>
  <div id="notification-container">
    <transition-group name="list-complete" tag="div">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="m-2 notification list-item"
        :class="[`is-${notification.color}`]"
      >
        <button
          class="delete"
          @click="dismissNotification(notification.id)"
        ></button>
        {{ notification.message }}
      </div>
    </transition-group>
  </div>
</template>

<script>
import { useStore } from "vuex";

export default {
  props: {
    notifications: {
      type: Array,
      required: true,
    },
  },
  setup() {
    const store = useStore();

    const dismissNotification = (id) => {
      store.dispatch("dismissNotification", id);
    };

    return { dismissNotification };
  },
};
</script>

<style lang="scss" scoped>
#notification-container {
  position: fixed;
  right: 0px;
  z-index: 30;
}

.notification {
  max-width: 250px;
}

.list-item {
  transition: all 0.8s ease;
}

.list-complete-enter-from,
.list-complete-leave-to {
  opacity: 0;
}

.list-complete-leave-active {
  position: absolute;
}
</style>
