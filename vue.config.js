module.exports = {
  css: {
    loaderOptions: {
      sass: {
        additionalData: '@import "@/assets/styles/variables.scss";',
      },
    },
  },
  transpileDependencies: ["formvuelate", "vega-lite"],
};
