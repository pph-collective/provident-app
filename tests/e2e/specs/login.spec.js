import accounts from "../../fixtures/accounts.json";

describe("Log In View", () => {
  beforeEach(() => {
    cy.logout();
    cy.task("db:teardown");
    cy.task("db:seed");
    cy.visit("/login");
  });

  it("Greets with log in", () => {
    cy.contains("h1", "Log In").should("exist");
  });

  it("Links to /register", () => {
    cy.get("button")
      .contains("Request Access")
      .click();
    cy.url().should("eq", Cypress.config().baseUrl + "register");
  });

  it("Submitting an empty form", () => {
    cy.get('[data-cy="login-form-button"]').click();
    // If an exception was thrown here, cypress will fail the test

    // Just make sure we're still not signed in
    cy.contains("h1", "Log In").should("exist");
    cy.visit("/");
    cy.get('[data-cy="navbar-burger"]').click();
    cy.get('[data-cy="login-button"]').should("exist");
  });

  it("Requires a password", () => {
    cy.get('[type="email"]').type(`${accounts.admin.email}`);
    cy.get('[data-cy="login-form-button"]').click();
    // If an exception was thrown here, cypress will fail the test

    // Just make sure we're still not signed in
    cy.contains("h1", "Log In").should("exist");
    cy.visit("/");
    cy.get('[data-cy="navbar-burger"]').click();
    cy.get('[data-cy="login-button"]').should("exist");
  });

  it("Requires valid username and password", () => {
    cy.get('[type="email"]').type(accounts.admin.email);
    cy.get('[type="password"]').type("invalid{enter}");
    cy.get('[data-cy="error-message"]').should(
      "contain",
      "The password is invalid or the user does not have a password"
    );
  });

  it("Navigates to / on successful login", () => {
    cy.get('[type="email"]').type(accounts.admin.email);
    cy.get('[type="password"]').type(`${accounts.admin.password}{enter}`);
    cy.url().should("eq", Cypress.config().baseUrl);
    cy.get("a")
      .contains("Log Out")
      .should("exist");
  });

  it("Logging in as a user that is still pending approval", () => {
    cy.get('[type="email"]').type(accounts.pending.email);
    cy.get('[type="password"]').type(`${accounts.pending.password}{enter}`);
    cy.get('[data-cy="error-message"]')
      .should("exist")
      .contains("User account not approved: pending");
  });

  it("Log in and out to check the auth Listener", () => {
    cy.login_by_permission("admin");
    cy.get('[data-cy="navbar-burger"]').click();
    cy.get('[data-cy="logout-button"]').should("exist");

    cy.logout();
    cy.get('[data-cy="login-button"]').should("exist");
  });
});
