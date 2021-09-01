describe("Form Assignment functionality", () => {
  beforeEach(() => {
    cy.login_by_permission("admin").then(() => {
      cy.visit("/admin/form_assignments");
    });
  });

  it("Form Assignments title heading", () => {
    cy.get(".panel-heading").should("contain", "Form Assignments");

    cy.contains('[data-cy="form-assignment-panel-block"]', "My Form")
      .find('[data-cy="release-date-tag"]')
      .should("contain", "2021-05-21");

    cy.contains('[data-cy="form-assignment-panel-block"]', "My Form")
      .find('[data-cy="expire-date-tag"]')
      .should("contain", "3000-09-09");

    cy.contains('[data-cy="form-assignment-panel-block"]', "My Form")
      .find('[data-cy="target-tags"]')
      .should("contain", "users")
      .should("contain", "admin@admin.com")
      .should("contain", "user@user.com")
      .should("not.contain", "organizations")
      .should("not.contain", "groups");

    cy.contains(
      '[data-cy="form-assignment-panel-block"]',
      "Simple Form"
    ).should("exist");
    cy.contains(
      '[data-cy="form-assignment-panel-block"]',
      "Unreleased Form"
    ).should("exist");
    cy.contains(
      '[data-cy="form-assignment-panel-block"]',
      "Sample Organization Form"
    ).should("exist");
  });
});
