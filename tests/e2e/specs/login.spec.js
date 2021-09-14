import ACCOUNTS from "../../fixtures/accounts.json";

describe("Log In View", () => {
  beforeEach(() => {
    cy.get('[data-cy="login-button"]').click();
  });

  it("Greets with log in", () => {
    cy.contains("h1", "Log In").should("exist");
  });

  it("Links to /register", () => {
    cy.get("button").contains("Request Access").click();
    cy.url().should("eq", Cypress.config().baseUrl + "register");
  });

  it("Submitting an empty form", () => {
    cy.get('[data-cy="login-form-button"]').click();
    // If an exception was thrown here, cypress will fail the test

    // Just make sure we're still not signed in
    cy.contains("h1", "Log In").should("exist");
    cy.get("[daya-cy='home']").click();
    cy.get('[data-cy="login-button"]').should("exist");
  });

  it("Requires a password", () => {
    cy.get('[type="email"]').type(`${ACCOUNTS.admin.email}`);
    cy.get('[data-cy="login-form-button"]').click();
    // If an exception was thrown here, cypress will fail the test

    // Just make sure we're still not signed in
    cy.contains("h1", "Log In").should("exist");
    cy.get("[daya-cy='home']").click();
    cy.get('[data-cy="login-button"]').should("exist");
  });

  it("Requires valid username and password", () => {
    cy.get('[type="email"]').type(ACCOUNTS.admin.email);
    cy.get('[type="password"]').type("invalid{enter}");
    cy.get('[data-cy="error-message"]').should(
      "contain",
      "The password is invalid or the user does not have a password"
    );
  });

  it("Navigates to / on successful login", () => {
    cy.get('[type="email"]').type(ACCOUNTS.admin.email);
    cy.get('[type="password"]').type(`${ACCOUNTS.admin.password}{enter}`);
    cy.get("a").should("contain", "Log Out");
    cy.url().should("eq", Cypress.config().baseUrl);
  });

  it("Logging in as a user that is still pending approval", () => {
    cy.get('[type="email"]').type(ACCOUNTS.pending.email);
    cy.get('[type="password"]').type(`${ACCOUNTS.pending.password}{enter}`);
    cy.get('[data-cy="error-message"]')
      .should("exist")
      .contains("User account not approved: pending");
  });

  it("Log in and out to check the auth Listener", () => {
    cy.login_by_permission("admin");
    cy.get('[data-cy="logout-button"]').should("exist");

    cy.logout();
    cy.get('[data-cy="login-button"]').should("exist");
  });

  it("Redirect back to previous page prior to logging in after login", () => {
    cy.get("[daya-cy='snack']").click();

    cy.get('[type="email"]').type(ACCOUNTS.approved.email);
    cy.get('[type="password"]').type(`${ACCOUNTS.approved.password}{enter}`);

    cy.location().should((loc) => {
      expect(loc.pathname).to.eq("/snack");
    });
  });
});
