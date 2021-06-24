import accounts from "../../fixtures/accounts.json";

describe("Admin Views and Powers", () => {
  beforeEach(() => {
    cy.login_by_permission("admin");
    cy.visit("/admin");
  });

  it("navigation bar to /admin", () => {
    cy.get('[data-cy="admin"]')
      .should("exist")
      .should("have.attr", "href", "/admin");
  });

  it("Review Access Requests header", () => {
    cy.contains("h1", "Review Access Requests");
  });

  it("View pending users", () => {
    cy.contains('[data-cy="user-request"]', accounts.pending.email).should(
      "exist"
    );
  });

  it("Approving a user", () => {
    cy.contains('[data-cy="user-request"]', accounts.pending.email)
      .get('[data-cy="approve"]')
      .should("exist")
      .click();
    cy.get('[data-cy="alert-message"]')
      .should("exist")
      .should("contain", `Success! ${accounts.pending.email} was approved`);

    // Try to log in
    cy.logout();
    cy.visit("/login");
    cy.get('[type="email"]').type(accounts.pending.email);
    cy.get('[type="password"]').type(`${accounts.pending.password}{enter}`);
    cy.url().should("eq", Cypress.config().baseUrl);
    cy.get("a")
      .contains("Log Out")
      .should("exist");
  });

  it("Denying a user", () => {
    cy.contains('[data-cy="user-request"]', accounts.pending.email)
      .get('[data-cy="deny"]')
      .should("exist")
      .click();
    cy.get('[data-cy="alert-message"]')
      .should("exist")
      .should("contain", `${accounts.pending.email} was denied`);

    // Try to log in as the denied user
    cy.logout();
    cy.visit("/login");
    cy.get('[type="email"]').type(accounts.pending.email);
    cy.get('[type="password"]').type(`${accounts.pending.password}{enter}`);
    cy.get('[data-cy="error-message"]')
      .should("exist")
      .contains("User account not approved: denied");
  });
});
