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
    // Confirm that forms are loaded prior to continuing
    cy.get('[data-cy="forms-panel-block"]').should(
      "not.contain",
      "No forms here"
    );

    cy.contains('[data-cy="forms-panel-block"]', "My Form")
      .find('[data-cy="status-tag"]')
      .should("contain", "Not Started");

    cy.get('[data-cy="launch-form-button"]')
      .should("exist")
      .first()
      .click();
    cy.get('[data-cy="active-form"]').should("exist");
    cy.get('[data-cy="active-form-title"]').should("contain", "My Form");
  });

  it("Save form as a draft", () => {
    // Confirm that the forms are loaded prior to continuing
    cy.get('[data-cy="forms-panel-block"]').should(
      "not.contain",
      "No forms here"
    );

    cy.contains('[data-cy="forms-panel-block"]', "Simple Form")
      .find('[data-cy="status-tag"]')
      .should("contain", "Not Started");

    // Click to launch the Simple Form
    cy.contains('[data-cy="forms-panel-block"]', "Simple Form")
      .find('[data-cy="launch-form-button"]')
      .click();

    // Assert that this is the simple form
    cy.get('[data-cy="active-form-title"]').should("contain", "Simple Form");

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
    cy.contains('[data-cy="forms-panel-block"]', "Simple Form")
      .find('[data-cy="launch-form-button"]')
      .click();

    // Check if textarea is saved and if editable
    cy.get('[data-cy="active-form"]')
      .find("textarea")
      .should("have.value", "Hello, how are you?")
      .type(" I'm doing well.")
      .should("have.value", "Hello, how are you? I'm doing well.");

    // Submit the form
    cy.get('[data-cy="active-form"]')
      .find("button")
      .contains("Submit")
      .should("be.enabled")
      .click();

    // Check no longer in to do
    cy.contains('[data-cy="forms-panel-block"]', "Simple Form").should(
      "not.exist"
    );

    // Click All
    // panel-tabs, contains submitted
    cy.get('[data-cy="panel-tabs"]')
      .find("a")
      .contains("All")
      .click();

    // Check form
    cy.contains('[data-cy="forms-panel-block"]', "Simple Form")
      .find('[data-cy="status-tag"]')
      .should("contain", "Submitted");

    cy.contains('[data-cy="forms-panel-block"]', "Simple Form")
      .find("launch-form-button")
      .should("not.exist");

    // Review form
    cy.contains('[data-cy="forms-panel-block"]', "Simple Form")
      .find('[data-cy="review-form-button"]')
      .should("exist")
      .click();

    cy.get('[data-cy="active-form"]')
      .find("textarea")
      .should("be.disabled");

    cy.get('[data-cy="close-form"]').click();

    // Check submitted tab
    cy.get('[data-cy="panel-tabs"]')
      .find("a")
      .contains("Submitted")
      .click();

    cy.contains('[data-cy="forms-panel-block"]', "Simple Form")
      .should("exist")
      .find('[data-cy="status-tag"]')
      .should("contain", "Submitted");

    // Review form
    cy.contains('[data-cy="forms-panel-block"]', "Simple Form")
      .find('[data-cy="review-form-button"]')
      .should("exist");
  });
});
