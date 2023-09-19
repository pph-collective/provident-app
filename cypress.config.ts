import path from "path";
import admin from 'firebase-admin'
import { initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { defineConfig } from 'cypress'
import { plugin as cypressFirebasePlugin } from 'cypress-firebase'
import { devServer } from "@cypress/vite-dev-server";

import { seedDatabase } from "./cypress/fixtures/utils.js"

import firebaseJSON from './firebase.json'
process.env.FIRESTORE_EMULATOR_HOST = `127.0.0.1:${firebaseJSON.emulators.firestore.port}`;
process.env.FIREBASE_AUTH_EMULATOR_HOST = `127.0.0.1:${firebaseJSON.emulators.auth.port}`;

const testEnvironmentPromise = initializeTestEnvironment({
  projectId: "provident-ri",
})

export default defineConfig({
  component: {
    devServer(devServerConfig) {
      return devServer({
        ...devServerConfig,
        viteConfig: require(path.resolve(__dirname, "..", "..", "vite.config.js")),
      })
    },
  },
  chromeWebSecurity: false,
  retries: {
    runMode: 2,
  },
  video: false,
  viewportWidth: 1200,
  viewportHeight: 800,
  blockHosts: '*.google-analytics.com',
  e2e: {
    setupNodeEvents(on, config) {
      on("task", {
        "db:teardown": async () => {
          const testEnvironment = await testEnvironmentPromise
          await testEnvironment.clearFirestore()
          return true
        },
        "db:seed": async () => {
          const success = await seedDatabase(admin);

          if (success) {
            return "SUCCESS db:seed -- Seeded Database";
          } else {
            return "SKIPPING db:seed -- admin is not on localhost";
          }
        },
        "auth:deleteUserByEmail": async (email) => {
          let auth_url_format = await admin
            .auth()
            .tenantManager()
            .authRequestHandler.authResourceUrlBuilder.getUrl();
          if (auth_url_format.includes("localhost")) {
            return admin
              .auth()
              .getUserByEmail(email)
              .then((userRecord) => {
                admin.auth().deleteUser(userRecord["uid"]);
                return userRecord;
              })
              .catch((error) => {
                console.log(
                  `User account associated with ${email} not found. Therefore no account was deleted.`
                );
                return error;
              });
          } else {
            return "SKIPPING auth:deleteUserByEmail -- admin is not on localhost";
          }
        },
        "auth:updateUserByEmail": async ({ email, userData }) => {
          let auth_url_format = await admin
            .auth()
            .tenantManager()
            .authRequestHandler.authResourceUrlBuilder.getUrl();
          if (auth_url_format.includes("localhost")) {
            return admin
              .auth()
              .getUserByEmail(email)
              .then((userRecord) => {
                admin.auth().updateUser(userRecord.uid, userData);
                return true;
              })
              .catch((error) => {
                console.log(
                  `User account associated with ${email} not found. Therefore no account was updated.`
                );
                return error;
              });
          } else {
            return "SKIPPING auth:updateUserByEmail -- admin is not on localhost";
          }
        },
      });

      return cypressFirebasePlugin(on, config, admin, {
        projectId: "provident-ri",
        databaseURL: "http://localhost:8088/"
      })
    },
    baseUrl: 'http://localhost:8080/',
    specPattern: 'cypress/e2e/**/*.spec.js',
  },
});
