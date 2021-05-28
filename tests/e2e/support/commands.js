// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
import fb from "../../../src/firebase";
import { attachCustomCommands } from "cypress-firebase";

// Emulate RTDB if Env variable is passed
const rtdbEmulatorHost = Cypress.env("FIREBASE_DATABASE_EMULATOR_HOST");
if (rtdbEmulatorHost) {
  fb.firebaseConfig.databaseURL = `http://${rtdbEmulatorHost}?ns=${fb.firebaseConfig.projectId}`;
}

// Emulate Firestore if Env variable is passed
const firestoreEmulatorHost = Cypress.env("FIRESTORE_EMULATOR_HOST");
if (firestoreEmulatorHost) {
  fb.db.settings({
    host: firestoreEmulatorHost,
    ssl: false
  });
}

const authEmulatorHost = Cypress.env("FIREBASE_AUTH_EMULATOR_HOST");
if (authEmulatorHost) {
  fb.auth.useEmulator(`http://${authEmulatorHost}/`);
  console.debug(`Using Auth emulator: http://${authEmulatorHost}/`);
}

attachCustomCommands({ Cypress, cy, fb });

Cypress.Commands.add("login", (email, password) => {
  fb.login(email, password);
});

// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
