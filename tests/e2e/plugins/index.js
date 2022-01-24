/* eslint-disable arrow-body-style */
// https://docs.cypress.io/guides/guides/plugins-guide.html

// if you need a custom webpack configuration you can uncomment the following import
// and then use the `file:preprocessor` event
// as explained in the cypress docs
// https://docs.cypress.io/api/plugins/preprocessors-api.html#Examples

// /* eslint-disable import/no-extraneous-dependencies, global-require */
const firebase = require("@firebase/rules-unit-testing");
const admin = require("firebase-admin");

const firebaseJSON = require("../../../firebase.json");
process.env.FIRESTORE_EMULATOR_HOST = `localhost:${firebaseJSON.emulators.firestore.port}`;
process.env.FIREBASE_AUTH_EMULATOR_HOST = `localhost:${firebaseJSON.emulators.auth.port}`;
const cypressFirebasePlugin = require("cypress-firebase").plugin;

const { startDevServer } = require("@cypress/webpack-dev-server");
const webpackConfig = require("@vue/cli-service/webpack.config.js");

const { seedDatabase } = require("../../fixtures/utils");

module.exports = (on, config) => {
  on("dev-server:start", (options) =>
    startDevServer({
      options,
      webpackConfig,
    })
  );

  on("task", {
    "db:teardown": () => {
      // Clears all data associated with a particular project
      // in the locally running Firestore instance
      return firebase
        .clearFirestoreData({
          projectId: "provident-ri",
        })
        .then(() => true)
        .catch((e) => {
          console.log(e);
          return false;
        });
    },
    "db:seed": async () => {
      const success = await seedDatabase(admin);

      if (success) {
        return "SUCCESS db:seed -- Seeded Database";
      } else {
        return "SKIPPING db:seed -- admin is not on localhost";
      }
    },
    "auth:deleteUserByEmail": (email) => {
      let auth_url_format =
        admin.auth().authRequestHandler.tenantMgmtResourceBuilder.urlFormat;
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
    "auth:updateUserByEmail": ({ email, userData }) => {
      let auth_url_format =
        admin.auth().authRequestHandler.tenantMgmtResourceBuilder.urlFormat;
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

  const extendedConfig = cypressFirebasePlugin(on, config, admin);

  return Object.assign({}, extendedConfig, {
    fixturesFolder: "tests/e2e/fixtures",
    integrationFolder: "tests/e2e/specs",
    screenshotsFolder: "tests/e2e/screenshots",
    videosFolder: "tests/e2e/videos",
    supportFile: "tests/e2e/support/index.js",
  });
};
