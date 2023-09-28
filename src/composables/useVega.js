import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import embed from "vega-embed";

export function useVega({
  spec,
  minWidth = ref(180),
  minHeight = ref(200),
  maxWidth = ref(4000),
  maxHeight = ref(4000),
  includeActions = ref(false),
  hasData = ref(true),
  el,
}) {
  const actionsWidth = computed(() => (includeActions.value ? 38 : 0));

  const view = ref(null);

  const getWidth = () => {
    if (el.value) {
      return Math.min(
        maxWidth.value,
        Math.max(
          minWidth.value,
          Math.min(el.value.parentElement.clientWidth, window.innerWidth),
        ) - actionsWidth.value,
      );
    }
    return minWidth.value;
  };

  const getHeight = () => {
    if (el.value) {
      return Math.min(
        maxHeight.value,
        Math.max(
          minHeight.value,
          Math.min(
            el.value.parentElement.clientHeight - 10,
            window.innerHeight,
          ),
        ),
      );
    }
    return minHeight.value;
  };

  const resizePlot = () => {
    if (view.value) {
      view.value.width(getWidth()).height(getHeight()).resize().run();
    }
  };

  let timeout;

  const resizeObserver = new ResizeObserver(() => {
    // If there's a timer, cancel it
    if (timeout) {
      window.clearTimeout(timeout);
    }
    timeout = window.setTimeout(() => {
      // Run our resize functions
      resizePlot();
    }, 100);
  });

  const updatePlot = () => {
    if (view.value) {
      view.value.finalize();
    }

    // don't try to render if we don't have data yet
    if (!hasData.value) return;

    // no element to render into yet
    if (!el.value) return;

    embed(el.value, spec.value, {
      actions: includeActions.value,
      theme: "vox",
      renderer: "svg",
      config: {
        background: null,
        autosize: "fit",
        width: getWidth(),
        height: getHeight(),
      },
    })
      .then((res) => {
        view.value = res.view;
      })
      .catch((err) => {
        // eslint disable-next-line no-console
        console.log(err);
      });
  };

  const finalize = () => {
    if (view.value) {
      view.value.finalize();
    }
    if (el.value) {
      resizeObserver.unobserve(el.value.parentElement);
    }
  };

  // lifecycle hooks
  onMounted(updatePlot);
  onMounted(() => resizeObserver.observe(el.value.parentElement));
  watch(spec, updatePlot);
  onUnmounted(finalize);

  return {
    view,
  };
}
