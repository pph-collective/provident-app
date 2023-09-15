import { defineConfig } from 'cypress'

export default defineConfig({
  chromeWebSecurity: false,
  retries: {
    runMode: 2,
  },
  video: false,
  viewportWidth: 1200,
  viewportHeight: 800,
  blockHosts: '*.google-analytics.com',
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    baseUrl: 'http://localhost:8080/',
    specPattern: 'cypress/e2e/**/*.spec.js',
  },
})
