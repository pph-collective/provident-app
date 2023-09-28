const listener = (binding) => (event) => {
  if (event.key === "Escape") {
    binding.value();
  }
};

export const esc = {
  beforeMount(el, binding) {
    document.addEventListener("keydown", listener(binding));
  },
  unmounted(el, binding) {
    document.removeEventListener("keydown", listener(binding));
  },
};
