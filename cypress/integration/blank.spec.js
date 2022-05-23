describe("Dashboard viewed as a user", () => {
  beforeEach(() => {
    cy.login_by_permission("admin");
    cy.visit("/snack/dashboard");
  });

  it("Nothing", () => {});
});
