const directive = {
  beforeMount(el, binding) {
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        binding.value();
      }
    });
  },
  unmounted(el, binding) {
    document.removeEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        binding.value();
      }
    });
  },
};
export const esc = { esc: directive };
