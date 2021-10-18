describe("User Views", () => {
  beforeEach(() => {
    cy.login_by_permission("approved");
  });

  it("User nav bar options loads", () => {
    cy.get('[data-cy="logout-button"]').should("exist");
    cy.get('[data-cy="home"]').should("exist").should("have.attr", "href", "/");
    cy.get('[data-cy="dashboard"]')
      .should("exist")
      .should("have.attr", "href", "/snack/dashboard");
    cy.get('[data-cy="forms"]')
      .should("exist")
      .should("have.attr", "href", "/snack/forms");
    cy.get('[data-cy="admin"]').should("not.exist");
  });

  it("navigating to /snack redirects to the dashboard", () => {
    cy.visit("/snack");

    // User should be redirected to the dashboard
    cy.url().should("eq", `${Cypress.config().baseUrl}snack/dashboard`);
    cy.get(".dashboard").should("exist");
    cy.get(".loading-icon", { timeout: 10000 }).should("not.exist");
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

  it("navigating to the dashboard shouldn't ask to log in", () => {
    cy.get('[data-cy="dashboard"]').click();
    cy.contains("h1", "Log In").should("not.exist");
  });
});
