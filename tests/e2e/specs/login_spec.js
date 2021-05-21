describe("/login", () => {
  beforeEach(() => {
    cy.visit("/login");
  });

  it("greets with Log in", () => {
    cy.contains("h1", "Log In");
  });

  it("links to /register", () => {
    cy.get("button")
      .contains("Request Access")
      .click();
    cy.url().should("eq", Cypress.config().baseUrl + "register");
  });

  it("requires email", () => {
    cy.get("form")
      .contains("Log In")
      .click();
    cy.get(".error_message").should(
      "contain",
      "The email address is badly formatted"
    );
  });

  it("requires password", () => {
    cy.get('[type="email"]').type("admin@admin.com{enter}");
    cy.get(".error-message").should(
      "contain",
      "The password is invalid or the user does not have a password"
    );
  });

  it("requires valid username and password", () => {
    cy.get('[type="email"]').type("admin@admin.com");
    cy.get('[type="password"]').type("invalid{enter}");
    cy.get(".error-message").should(
      "contain",
      "The password is invalid or the user does not have a password"
    );
  });

  it("navigates to / on successful login", () => {
    // TODO: Need to get cypress and firebase connected to actually test logging in
    cy.get('[type="email"]').type("admin@admin.com");
    cy.get('[type="password"]').type("admin1{enter}");
    cy.url().should("eq", Cypress.config().baseUrl);
  });
});
