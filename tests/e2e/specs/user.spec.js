describe("User Views", () => {
  beforeEach(() => {
    cy.login_by_permission("approved");
    cy.visit("/");
  });

  it("log out button exists", () => {
    cy.get('[data-cy="navbar-burger"]').click();
    cy.get('[data-cy="logout-button"]').should("exist");
  });

  it("navigation bar link to home should exist", () => {
    cy.get('[data-cy="home"]')
      .should("exist")
      .should("have.attr", "href", "/");
  });

  it("navigation bar to /admin doesn't exist", () => {
    cy.get('[data-cy="admin"]').should("not.exist");
  });

  it("navigating to /admin shouldn't be allowed", () => {
    cy.visit("/admin");

    // User should be redirected
    cy.url().should("eq", Cypress.config().baseUrl);
  });

  it("navigating to /snack shouldn't ask to log in", () => {
    cy.visit("/snack");
    cy.contains("h1", "Log In").should("not.exist");
  });
});
