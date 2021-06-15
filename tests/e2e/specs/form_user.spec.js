describe("Forms viewed as a user", () => {
  beforeEach(() => {
    cy.logout();
    cy.task("db:teardown");
    cy.task("db:seed");
    cy.login_by_permission("approved").then(() => {
      cy.visit("/snack/forms");
    });
  });

  it("Form title heading", () => {
    cy.get('[data-cy="form-panel-heading"]').should("not.be.empty");
  });

  it("Release date is not viewable as a user", () => {
    cy.get('[data-cy="release-date-tag"]').should("not.exist");
  });

  it("Released forms should be viewable and see status", () => {
    cy.contains('[data-cy="forms-panel-block"]', "My Form")
      .should("exist")
      .find('[data-cy="status-tag"]')
      .should("contain", "Not Started");

    cy.contains('[data-cy="forms-panel-block"]', "Simple Form")
      .should("exist")
      .find('[data-cy="status-tag"]')
      .should("contain", "Not Started");
  });

  it("Unreleased forms should not be viewable", () => {
    cy.contains('[data-cy="forms-panel-block"]', "Unreleased Form").should(
      "not.exist"
    );
  });
});
