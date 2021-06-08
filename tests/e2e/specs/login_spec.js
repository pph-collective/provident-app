describe("Log In View", () => {
  beforeEach(() => {
    cy.logout();
    cy.task("db:teardown");
    cy.task("db:seed");
    cy.visit("/login");
  });

  it("greets with Log in", () => {
    cy.contains("h1", "Log In").should("exist");
  });

  it("links to /register", () => {
    cy.get("button")
      .contains("Request Access")
      .click();
    cy.url().should("eq", Cypress.config().baseUrl + "register");
  });

  it("requires email", () => {
    cy.get("form").submit();
    cy.get('[data-cy="error-message"]').should(
      "contain",
      "The email address is badly formatted"
    );
  });

  it("requires password", () => {
    cy.get('[type="email"]').type("admin@admin.com{enter}");
    cy.get('[data-cy="error-message"]').should(
      "contain",
      "The password is invalid or the user does not have a password"
    );
  });

  it("requires valid username and password", () => {
    cy.get('[type="email"]').type("admin@admin.com");
    cy.get('[type="password"]').type("invalid{enter}");
    cy.get('[data-cy="error-message"]').should(
      "contain",
      "The password is invalid or the user does not have a password"
    );
  });

  it("navigates to / on successful login", () => {
    cy.get('[type="email"]').type("admin@admin.com");
    cy.get('[type="password"]').type("admin1{enter}");
    cy.url().should("eq", Cypress.config().baseUrl);
    cy.get("a")
      .contains("Log Out")
      .should("exist");
  });

  it("Logging in as a user that is still pending approval", () => {
    cy.get('[type="email"]').type("user1@user.com");
    cy.get('[type="password"]').type("user-password{enter}");
    cy.get('[data-cy="error-message"]')
      .should("exist")
      .contains("User account not approved: pending");
  });

  it("Log In and Out to check Auth Listener", () => {
    cy.login_by_permission("admin");
    cy.get('[data-cy="navbar-burger"]').click();
    cy.get('[data-cy="logout-button"]').should("exist");

    cy.logout();
    cy.get('[data-cy="login-button"]').should("exist");
  });
});
