<template>
  <div id="notification-container">
    <transition-group name="list-complete" tag="div">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="my-2 notification list-item"
        :class="[`is-${notification.color}`]"
      >
        <button class="delete" @click="dismissNotification(notification.id)" />
        {{ notification.message }}
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useProvidentStore } from "../store";

defineProps({
  notifications: {
    type: Array,
    default: () => [],
  },
});

const store = useProvidentStore();

const dismissNotification = (id) => {
  store.dismissNotification(id);
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/main.scss";

#notification-container {
  position: fixed;
  right: 0;
  z-index: 30;
  max-width: calc(max(25vw, 250px));

  @include mobile {
    max-width: 100%;
    width: 100%;
  }
}

.notification {
  line-height: 1.1;
  padding: 8px 28px 8px 12px;
  margin-left: 8px;
  margin-right: 8px;
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
