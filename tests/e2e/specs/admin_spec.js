describe("Admin", () => {
  beforeEach(() => {
    cy.login("admin@admin.com", "admin1");
    cy.visit("/admin");
  });

  it("navigation bar to /admin", () => {
    cy.get("#navbar-contents > div.navbar-start > a:nth-child(4)")
      .should("have.attr", "href")
      .and("include", "admin");
  });

  it("Review Access Requests header", () => {
    cy.contains("h1", "Review Access Requests");
  });

  // Ability to approve / deny users
  // TODO: Add users to approve / deny
});
