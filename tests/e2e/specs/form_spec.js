describe("Forms as an admin", () => {
  beforeEach(() => {
    cy.logout();
    // Database teardown
    // Database reseed
    cy.login_by_permission("admin").then(() => {
      cy.visit("/snack/forms");
    });
  });

  it("Form title heading", () => {
    cy.get('[data-cy="form-panel-heading').should("contain", "I am forms!");
  });

  it("Release date is viewable as an admin", () => {
    cy.get('[data-cy="release-date-tag"]')
      .should("exist")
      .should("contain", "2021-05-21");
  });

  it("Starting status of form", () => {
    cy.get('[data-cy="status-tag"]').should("contain", "Not Started");
  });

  it("Launch form button", () => {
    cy.get('[data-cy="launch-form-button"]').should("exist");
  });

  it("Launch form should bring up modal", () => {
    cy.get('[data-cy="launch-form-button"]')
      .should("exist")
      .click();
    cy.get('[data-cy="active-form"]').should("exist");
    // cy.get('[data-cy="form-title"]').should("contain", "My Form");
  });

  // it("Save form as a draft", () => {
  //   // Be able to reopen form and edit
  // })
  //
  // it("submitting a valid form", () => {
  //   // Submit form
  //   // Status changed
  //   // Should be able to see the submitted form
  //   // Confirm cannot edit form
  // });
  //
  // it("submitting an invalid form", () => {
  //   // Get an error message
  // });
});
