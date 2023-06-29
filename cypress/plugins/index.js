/* eslint-disable arrow-body-style */
// https://docs.cypress.io/guides/guides/plugins-guide.html

// /* eslint-disable import/no-extraneous-dependencies, global-require */
const firebase = require("@firebase/rules-unit-testing");
const admin = require("firebase-admin");

const firebaseJSON = require("../../firebase.json");
process.env.FIRESTORE_EMULATOR_HOST = `localhost:${firebaseJSON.emulators.firestore.port}`;
process.env.FIREBASE_AUTH_EMULATOR_HOST = `localhost:${firebaseJSON.emulators.auth.port}`;
const cypressFirebasePlugin = require("cypress-firebase").plugin;

const path = require("path");
const { startDevServer } = require("@cypress/vite-dev-server");

const { seedDatabase } = require("../fixtures/utils");

module.exports = (on, config) => {
  on("dev-server:start", (options) =>
    startDevServer({
      options,
      viteConfig: {
        configFile: path.resolve(__dirname, "..", "..", "vite.config.js"),
      },
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

  return cypressFirebasePlugin(on, config, admin);
};
