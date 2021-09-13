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

const SEED = require("../../fixtures/seed.json");

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
    "db:seed": () => {
      if (admin.firestore()._settings.servicePath === "localhost") {
        const writeBatch = admin.firestore().batch();
        if (SEED) {
          for (const [collectionName, documents] of Object.entries(SEED)) {
            let collection = admin.firestore().collection(collectionName);
            for (const [documentPath, subCollections] of Object.entries(
              documents
            )) {
              for (const [subCollectionPath, subDocuments] of Object.entries(
                subCollections
              )) {
                if (subCollectionPath === "data") {
                  writeBatch.set(collection.doc(documentPath), subDocuments);
                } else {
                  for (const [subDocumentPath, data] of Object.entries(
                    subDocuments
                  )) {
                    writeBatch.set(
                      collection
                        .doc(documentPath)
                        .collection(subCollectionPath)
                        .doc(subDocumentPath),
                      data
                    );
                  }
                }
              }
            }
          }
        }
        return writeBatch.commit();
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
    integrationFolder: "tests/e2e/specs",
    supportFile: "tests/e2e/support/index.js",
  });
};
