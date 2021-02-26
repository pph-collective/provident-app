import { ref, onMounted, onUnmounted } from "vue";

export function useMobileListener() {
  const MOBILE_SIZE = 760;

  const isMobile = ref(window.innerWidth <= MOBILE_SIZE);

  function update() {
    isMobile.value = window.innerWidth <= MOBILE_SIZE;
  }

  onMounted(() => {
    window.addEventListener("resize", update);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", update);
  });

  return { isMobile };
}
