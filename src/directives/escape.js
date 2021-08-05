const listener = (binding) => (event) => {
  if (event.key === "Escape") {
    binding.value();
  }
};

const directive = {
  beforeMount(el, binding) {
    document.addEventListener("keydown", listener(binding));
  },
  unmounted(el, binding) {
    document.removeEventListener("keydown", listener(binding));
  },
};
export const esc = { esc: directive };
