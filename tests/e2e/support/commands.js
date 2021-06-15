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

const accounts = require("../../fixtures/accounts.json");

attachCustomCommands({ Cypress, cy, fb });

Cypress.Commands.add("login", (email, password) => {
  fb.login(email, password);
});

Cypress.Commands.add("login_by_permission", permission_level => {
  const account = accounts[permission_level];
  if (account) {
    fb.login(account["email"], account["password"]);
    cy.log(`Logged in with permission level: ${permission_level}`);
  } else {
    console.log(
      `Account with the following permission level doesn't exist in accounts.json: ${permission_level}.`
    );
  }
});

Cypress.Commands.add("logout", () => {
  fb.logout();
  cy.log("Logged out");
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
