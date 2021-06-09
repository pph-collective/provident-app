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

const seed = require("../../fixtures/seed.json");

// Edit the Seed
// Set the unreleased form to release tomorrow
let today = new Date();
let tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);
seed.forms.test3.release_date = tomorrow.toISOString().split("T")[0];

module.exports = (on, config) => {
  on("dev-server:start", options =>
    startDevServer({
      options,
      webpackConfig
    })
  );

  on("task", {
    "db:teardown": () => {
      try {
        // Clears all data associated with a particular project
        // in the locally running Firestore instance
        firebase.clearFirestoreData({
          projectId: "provident-ri"
        });
        return true;
      } catch (error) {
        return error;
      }
    },
    "db:seed": () => {
      if (admin.firestore()._settings.servicePath === "localhost") {
        if (seed) {
          for (const [collection, documents] of Object.entries(seed)) {
            for (const [documentPath, data] of Object.entries(documents)) {
              admin
                .firestore()
                .collection(collection)
                .doc(documentPath)
                .set(data);
            }
          }
        }
        return seed;
      } else {
        return "SKIPPING db:seed -- admin is not on localhost";
      }
    },
    "db:deleteUserByEmail": email => {
      let auth_url_format = admin.auth().authRequestHandler
        .tenantMgmtResourceBuilder.urlFormat;
      if (auth_url_format.includes("localhost")) {
        admin
          .auth()
          .getUserByEmail(email)
          .then(userRecord => {
            admin.auth().deleteUser(userRecord["uid"]);
            return userRecord;
          })
          .catch(error => {
            console.log("Error fetching user data:", error);
            return error;
          });
        return false;
      } else {
        return "SKIPPING db:seed -- admin is not on localhost";
      }
    }
  });

  const extendedConfig = cypressFirebasePlugin(on, config, admin);

  return Object.assign({}, extendedConfig, {
    fixturesFolder: "tests/e2e/fixtures",
    integrationFolder: "tests/e2e/specs",
    screenshotsFolder: "tests/e2e/screenshots",
    videosFolder: "tests/e2e/videos",
    supportFile: "tests/e2e/support/index.js"
  });
};
