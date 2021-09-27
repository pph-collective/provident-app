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
  cy.get("[data-cy='home']").click();
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
  cy.get("[data-cy='home']").click();
});

Cypress.Commands.add("logout", () => {
  cy.get(".loading-icon", { timeout: 6000 }).should("not.exist");
  fb.logout();
  cy.get("[data-cy='home']").click();
  cy.get("[data-cy='login-button']").should("exist");
  cy.log("Logged out");
});

Cypress.Commands.add(
  "registerUser",
  ({ email, name, organization, password }) => {
    cy.logout();
    // Register a user
    cy.get("[data-cy='login-button']").click();
    cy.get("[data-cy='request-access-button']").click();

    cy.get('[type="email"]').type(email);
    cy.get('[data-cy="form-name"]').type(name);
    cy.get('[data-cy="form-organization"]').select(organization);
    cy.get('[data-cy="form-password"]').type(password);
    cy.get('[data-cy="form-confirm-password"]').type(password);
    cy.get('[data-cy="form-terms"]').click();

    cy.get(".button").contains("Request Access").should("be.enabled");
    cy.get("form").submit();
    cy.get('[data-cy="error-message"]').should("not.exist");
    cy.get('[data-cy="success-message"]')
      .should("exist")
      .contains("Your request has been received.");
  }
);

Cypress.Commands.add("approveUser", (email) => {
  cy.logout();
  cy.login_by_permission("admin").then(() => {
    // Need to navigate to another page before admin button appears
    cy.get("[data-cy='home']").click();
    cy.get("[data-cy='admin']").should("exist").click();
  });

  cy.contains('[data-cy="user-request"]', email)
    .find('[data-cy="approve"]')
    .should("exist")
    .click();
  cy.get(".loading-icon").should("not.exist");
});
