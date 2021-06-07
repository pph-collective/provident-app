describe("Forms as an admin", () => {
  beforeEach(() => {
    cy.logout();
    cy.task("db:teardown");
    cy.task("db:seed");
    cy.login_by_permission("admin").then(() => {
      cy.visit("/snack/forms");
    });
  });

  it("Form title heading", () => {
    cy.get('[data-cy="form-panel-heading"]').should("contain", "I am forms!");
  });

  it("Release date is viewable as an admin", () => {
    cy.get('[data-cy="forms-panel-block"]').should(
      "not.contain",
      "No forms here"
    );
    cy.get('[data-cy="release-date-tag"]')
      .should("exist")
      .should("contain", "2021-05-21");
  });

  it("Starting status of form", () => {
    cy.get('[data-cy="forms-panel-block"]').should(
      "not.contain",
      "No forms here"
    );
    cy.get('[data-cy="status-tag"]').should("contain", "Not Started");
  });

  it("Launch form button", () => {
    cy.get('[data-cy="forms-panel-block"]').should(
      "not.contain",
      "No forms here"
    );
    cy.get('[data-cy="launch-form-button"]').should("exist");
  });

  it("Launch form should bring up modal", () => {
    cy.get('[data-cy="forms-panel-block"]').should(
      "not.contain",
      "No forms here"
    );

    cy.get('[data-cy="launch-form-button"]')
      .should("exist")
      .first()
      .click();
    cy.get('[data-cy="active-form"]').should("exist");
    cy.get('[data-cy="form-title"]').should("contain", "My Form");
  });

  it("Save form as a draft", () => {
    cy.get('[data-cy="forms-panel-block"]').should(
      "not.contain",
      "No forms here"
    );

    // TODO: Remove this once the uncaught exception bug is fixed
    Cypress.on("uncaught:exception", err => {
      // returning false here prevents Cypress from
      // failing the test
      // debugger
      console.log("Skipping the following error");
      console.log(err.message);
      return false;
    });

    // Click to launch the Simple Form
    cy.get('[data-cy="form-panel"]>[data-cy="forms-panel-block"]')
      .eq(1)
      .find('[data-cy="launch-form-button"]')
      .should("exist")
      .click();

    // Save button should be disabled
    cy.get('[data-cy="active-form"]')
      .find("button")
      .contains("Save")
      .should("be.disabled");

    // Type into the textarea
    cy.get('[data-cy="active-form"]')
      .find("textarea")
      .type("Hello, how are you?");

    // Save the form
    cy.get('[data-cy="active-form"]')
      .find("button")
      .contains("Save")
      .should("be.enabled")
      .click();

    // Form message
    cy.get('[data-cy="form-message"]').should(
      "contain",
      "Form successfully saved"
    );

    // Close form
    cy.get('[data-cy="close-form"]').click();

    // Assert Status: Draft
    cy.get('[data-cy="form-panel"]>[data-cy="forms-panel-block"]')
      .eq(1)
      .find('[data-cy="status-tag"]')
      .should("contain", "Draft");

    // Reopen
    // Click to launch the Simple Form
    cy.get('[data-cy="form-panel"]>[data-cy="forms-panel-block"]')
      .eq(1)
      .find('[data-cy="launch-form-button"]')
      .should("exist")
      .click();

    // Check if textarea is saved
    cy.get('[data-cy="active-form"]')
      .find("textarea")
      .should("have.value", "Hello, how are you?");
  });
});
