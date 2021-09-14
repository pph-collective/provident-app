// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";
import ACCOUNTS from "../../fixtures/accounts.json";

// Runs prior to every test across all files
beforeEach(() => {
  cy.logout();

  // Reset auth
  // Currently only resets the password for approved user since it is altered in reset-password.spec.js
  // If needed to reset all of the auth, loop through all of ACCOUNTS
  cy.task("auth:updateUserByEmail", {
    email: ACCOUNTS.approved.email,
    userData: { password: ACCOUNTS.approved.password },
  });

  // Reset database
  cy.task("db:teardown");
  cy.task("db:seed");

  // cy.wait(500); // wait a half beat for db to catch up
  //
  // cy.get("body").then(($body) => {
  //   if (
  //     $body.find("[data-cy='logout-button']").length === 0 &&
  //     $body.find("[data-cy='login-button']").length === 0
  //   ) {
  //     cy.visit("/");
  //   }
  // });
});

// afterEach(() => {
//   cy.logout();
// });
