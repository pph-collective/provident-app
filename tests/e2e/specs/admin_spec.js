describe("/login", () => {
  beforeEach(() => {
    cy.login("admin@admin.com", "admin1");
  });

  it("link to /admin", () => {
    cy.visit("");
    cy.get("#navbar-contents > div.navbar-start > a:nth-child(4)")
      .should("have.attr", "href")
      .and("include", "admin");
  });

  // Navigate to admin tab
  // Ability to approve / deny users
});
