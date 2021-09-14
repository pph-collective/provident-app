describe("User Views", () => {
  beforeEach(() => {
    cy.login_by_permission("approved");
  });

  it("log out button exists", () => {
    cy.get('[data-cy="logout-button"]').should("exist");
  });

  it("navigation bar link to home should exist", () => {
    cy.get('[data-cy="home"]').should("exist").should("have.attr", "href", "/");
  });

  it("navigation bar to /admin doesn't exist", () => {
    cy.get('[data-cy="admin"]').should("not.exist");
  });

  it("navigating to /admin shouldn't be allowed", () => {
    cy.visit("/admin");

    // User should be redirected
    cy.url().should("eq", Cypress.config().baseUrl);
  });

  it("navigating to /admin/form_assignments shouldn't be allowed", () => {
    cy.visit("/admin/form_assignments");

    // User should be redirected
    cy.url().should("eq", Cypress.config().baseUrl);
  });

  it("navigating to /admin/review_access_requests shouldn't be allowed", () => {
    cy.visit("/admin/review_access_requests");

    // User should be redirected
    cy.url().should("eq", Cypress.config().baseUrl);
  });

  it("navigating to /snack shouldn't ask to log in", () => {
    cy.get("a.navbar-item").contains("Snack").click();
    cy.contains("h1", "Log In").should("not.exist");
  });
});
