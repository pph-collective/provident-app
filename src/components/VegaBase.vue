<template>
  <div ref="el"></div>
</template>

<script>
import embed from "vega-embed";
import { ref, toRefs, computed, watch, onMounted, onUnmounted } from "vue";

export default {
  name: "VegaBase",
  props: {
    spec: Object,
    minWidth: {
      type: Number,
      required: false,
      default: 200
    },
    includeActions: {
      type: Boolean,
      required: false,
      default: false
    },
    hasData: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  setup(props) {
    const { spec, minWidth, includeActions, hasData } = toRefs(props);
    const actionsWidth = computed(() => (includeActions.value ? 28 : 0));

    // element that the component gets mounted into
    const el = ref(null);

    const view = ref(null);

    const getWidth = () => {
      return (
        Math.max(minWidth.value, el.value.parentElement.clientWidth) -
        actionsWidth.value
      );
    };

    const resizePlot = () => {
      if (view.value) {
        view.value
          .width(getWidth())
          .resize()
          .runAsync();
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
          width: getWidth()
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
      el
    };
  }
};
</script>
