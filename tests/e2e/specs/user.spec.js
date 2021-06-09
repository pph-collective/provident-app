describe("User Views", () => {
  beforeEach(() => {
    cy.logout();
    cy.login("user@user.com", "user-password");
    cy.visit("/");
  });

  it("log out button exists", () => {
    cy.get("#navbar-contents a")
      .contains("Log Out")
      .should("exist");
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
    // Validate that this isn't the admin page
    // TODO: Where should it redirect to? Create a new page?
    cy.contains("h1", "Log In").should("not.exist");
  });

  it("navigating to /snack shouldn't ask to log in", () => {
    cy.visit("/snack");
    cy.contains("h1", "Log In").should("not.exist");
  });
});
