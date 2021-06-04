import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import embed from "vega-embed";

export function useVega({
  spec,
  minWidth = ref(200),
  minHeight = ref(200),
  includeActions = ref(false),
  hasData = ref(true),
  el
}) {
  const actionsWidth = computed(() => (includeActions.value ? 38 : 0));

  const view = ref(null);

  const getWidth = () => {
    if (el.value) {
      return (
        Math.max(minWidth.value, el.value.parentElement.clientWidth) -
        actionsWidth.value
      );
    }
    return minWidth.value;
  };

  const getHeight = () => {
    if (el.value) {
      return Math.max(
        minHeight.value,
        Math.min(el.value.parentElement.clientHeight - 10, window.innerHeight)
      );
    }
    return minHeight.value;
  };

  const resizePlot = () => {
    if (view.value) {
      view.value
        .width(getWidth())
        .height(getHeight())
        .resize()
        .run();
    }
  };

  const resizeObserver = new ResizeObserver(resizePlot);

  const updatePlot = () => {
    if (view.value) {
      view.value.finalize();
    }

    // don't try to render if we don't have data yet
    if (!hasData.value) return;

    embed(el.value, spec.value, {
      actions: includeActions.value,
      theme: "vox",
      renderer: "svg",
      config: {
        background: null,
        autosize: "fit",
        width: getWidth(),
        height: getHeight()
      }
    })
      .then(res => {
        view.value = res.view;
      })
      .catch(err => {
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
    view
  };
}
