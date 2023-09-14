describe("User Views", () => {
  beforeEach(() => {
    cy.login_by_permission("approved");
  });

  it("User nav bar options loads", () => {
    cy.get('[data-cy="logout-button"]').should("exist");
    cy.get('[data-cy="home"]').should("exist").should("have.attr", "href", "/");
    cy.get('[data-cy="dashboard"]')
      .should("exist")
      .should("have.attr", "href", "/snack/dashboard?zoomed=false");
    cy.get('[data-cy="forms"]')
      .should("exist")
      .should("have.attr", "href", "/snack/forms");
    cy.get('[data-cy="admin"]').should("not.exist");
  });

  it("navigating to /snack redirects to the dashboard", () => {
    cy.visit("/snack");

    // User should be redirected to the dashboard
    cy.url().should(
      "eq",
      `${Cypress.config().baseUrl}snack/dashboard?zoomed=false`
    );
    cy.waitLoaded(".dashboard");
  });

  it("navigating to /admin pages shouldn't be allowed", () => {
    cy.visit("/admin");
    cy.url().should("eq", Cypress.config().baseUrl);

    cy.visit("/admin/form_assignments");
    cy.url().should("eq", Cypress.config().baseUrl);

    cy.visit("/admin/review_access_requests");
    cy.url().should("eq", Cypress.config().baseUrl);

    cy.visit("/admin/user_management");
    cy.url().should("eq", Cypress.config().baseUrl);

    cy.visit("/admin/organization_management");
    cy.url().should("eq", Cypress.config().baseUrl);

    cy.visit("/admin/email");
    cy.url().should("eq", Cypress.config().baseUrl);

    cy.visit("/admin/review_forms");
    cy.url().should("eq", Cypress.config().baseUrl);
  });

  it("navigating to the dashboard shouldn't ask to log in", () => {
    cy.get('[data-cy="dashboard"]').click();
    cy.contains("h1", "Log In").should("not.exist");
  });
});
