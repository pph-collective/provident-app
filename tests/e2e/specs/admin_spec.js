describe("Admin Views and Powers", () => {
  beforeEach(() => {
    cy.login("admin@admin.com", "admin1");
    cy.visit("/admin");
  });

  it("navigation bar to /admin", () => {
    cy.get("#navbar-contents a").should("have.attr", "href", "/admin");
  });

  it("Review Access Requests header", () => {
    cy.contains("h1", "Review Access Requests");
  });

  // Ability to approve / deny users
  // TODO: Add users to approve / deny
});
