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

const ACCOUNTS = require("../../fixtures/accounts.json");

attachCustomCommands({ Cypress, cy, fb });

Cypress.Commands.add("login", (email, password) => {
  cy.wrap(fb.login(email, password));
});

Cypress.Commands.add("login_by_permission", (permission_level) => {
  const account = ACCOUNTS[permission_level];
  if (account) {
    cy.wrap(fb.login(account["email"], account["password"])).should(
      "not.eq",
      "{}"
    );
    cy.log(`Logged in with permission level: ${permission_level}`);
  } else {
    console.log(
      `Account with the following permission level doesn't exist in accounts.json: ${permission_level}.`
    );
  }
});

Cypress.Commands.add("logout", () => {
  fb.logout();
  cy.visit("/");
  cy.log("Logged out");
});
