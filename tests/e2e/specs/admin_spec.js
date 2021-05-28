describe("Admin Views and Powers", () => {
  beforeEach(() => {
    cy.logout();
    cy.task("db:teardown");
    cy.task("db:seed");
    cy.login("admin@admin.com", "admin1");
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
    cy.get('[data-cy="user-requests"]')
      .contains("td", "user1@user.com")
      .should("be.visible");
  });

  it("Approving a user", () => {
    cy.get('[data-cy="user-requests"]')
      .contains('[data-cy="email"]', "user1@user.com")
      .siblings()
      .get('[data-cy="approve"]')
      .should("exist")
      .click();
    cy.get('[data-cy="alert-message"]')
      .should("exist")
      .should("contain", "Success!");
  });

  it("Denying a user", () => {
    cy.get('[data-cy="user-requests"]')
      .contains('[data-cy="email"]', "user1@user.com")
      .siblings()
      .get('[data-cy="deny"]')
      .should("exist")
      .click();
    cy.get('[data-cy="alert-message"]')
      .should("exist")
      .should("contain", "Successfully denied!");
  });
});
