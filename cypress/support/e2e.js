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

export const resetDatabase = () => {
  cy.task("db:teardown");
  cy.task("db:seed");
};

// Runs prior to every test across all files
beforeEach(() => {
  cy.get("body").then(($body) => {
    if (
      $body.find("[data-cy='logout-button']").length === 0 &&
      $body.find("[data-cy='login-button']").length === 0
    ) {
      cy.visit("/");
    }
  });

  cy.logout();
  resetDatabase();
  cy.reload();
});
