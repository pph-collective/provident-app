describe("Form functionality", () => {
  beforeEach(() => {
    cy.login_by_permission("admin").then(() => {
      cy.visit("/snack/forms");
    });
  });

  it("Form title heading", () => {
    cy.get('[data-cy="form-panel-heading"]').should("not.be.empty");
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

  it("Trying to submit an empty form, then closing it without saving", () => {
    // Confirm that forms are loaded prior to continuing
    cy.get('[data-cy="forms-panel-block"]').should(
      "not.contain",
      "No forms here"
    );

    cy.contains('[data-cy="forms-panel-block"]', "My Form")
      .find('[data-cy="status-tag"]')
      .should("contain", "Not Started");

    cy.contains('[data-cy="forms-panel-block"]', "My Form")
      .find('[data-cy="launch-form-button"]')
      .click();

    cy.get('[data-cy="active-form-modal"]').should("exist");
    cy.get('[data-cy="active-form-title"]').should("contain", "My Form");

    // Try to submit the form
    cy.get('[data-cy="active-form-modal"]')
      .find("button")
      .contains("Submit")
      .click();

    cy.get('[data-cy="active-form-modal"]').should("exist");
    cy.get('[data-cy="close-form"]').click();
    cy.contains('[data-cy="forms-panel-block"]', "My Form")
      .find('[data-cy="status-tag"]')
      .should("contain", "Not Started");
  });

  it("Submitting a valid form, My Form", () => {
    cy.wrap(["admin", "approved"]).each((permission_level) => {
      cy.logout();
      cy.login_by_permission(permission_level);
      cy.visit("/snack/forms");

      cy.contains('[data-cy="forms-panel-block"]', "My Form")
        .find('[data-cy="status-tag"]')
        .should("contain", "Not Started");

      cy.contains('[data-cy="forms-panel-block"]', "My Form")
        .find('[data-cy="status-tag"]')
        .should("contain", "Not Started");

      cy.contains('[data-cy="forms-panel-block"]', "My Form")
        .find('[data-cy="launch-form-button"]')
        .click();

      cy.get('[data-cy="active-form-title"]').should("contain", "My Form");

      // Too young
      cy.get('[model="age"]').find("input").type("10");

      cy.get('[model="old"]').should("not.exist");

      cy.get('[model="age"]')
        .find(".has-text-danger")
        .should("contain", "this must be greater than or equal to 13");

      // Old
      cy.get('[model="age"]').find("input").clear().type("103");

      // Select yes
      cy.get('[model="old"]').should("exist").find("input").first().check();

      // What's your favorite color, dropdown menu
      cy.get('[model="favorite_color"]').find("select").select("Green");

      cy.get('[model="other_favorite_color"]').should("not.exist");

      // Other Favorite Color
      cy.get('[model="favorite_color"]').find("select").select("Other");

      cy.get('[model="other_favorite_color"]')
        .should("exist")
        .find("input")
        .type("all of them");

      // Essay about favorite color
      cy.get('[model="color_essay"]')
        .find("textarea")
        .type("I can't decide on a single color.");

      // Submit the form
      cy.get('[data-cy="active-form-modal"]')
        .find("button")
        .contains("Submit")
        .should("be.enabled")
        .click();

      cy.contains('[data-cy="forms-panel-block"]', "My Form").should(
        "not.exist"
      );

      // Click All
      // panel-tabs, contains submitted
      cy.get('[data-cy="panel-tabs"]').find("a").contains("All").click();

      // Check form status
      cy.contains('[data-cy="forms-panel-block"]', "My Form")
        .find('[data-cy="status-tag"]')
        .should("contain", "Submitted");

      cy.contains('[data-cy="forms-panel-block"]', "My Form")
        .find("launch-form-button")
        .should("not.exist");

      // Review form
      cy.contains('[data-cy="forms-panel-block"]', "My Form")
        .find('[data-cy="review-form-button"]')
        .should("exist")
        .click();

      // Everything is disabled and has the previous value
      cy.get('[model="age"]')
        .find("input")
        .should("exist")
        .should("be.disabled")
        .should("have.value", "103");

      cy.get('[model="old"]')
        .find("input")
        .should("be.disabled")
        .first()
        .should("be.checked");

      cy.get('[model="favorite_color"]')
        .find("select")
        .should("be.disabled")
        .find("option:selected");

      cy.get('[model="other_favorite_color"]')
        .should("exist")
        .find("input")
        .should("be.disabled")
        .should("have.value", "all of them");

      cy.get('[data-cy="close-form"]').click();

      // Check submitted tab
      cy.get('[data-cy="panel-tabs"]').find("a").contains("Submitted").click();

      cy.contains('[data-cy="forms-panel-block"]', "My Form")
        .should("exist")
        .find('[data-cy="status-tag"]')
        .should("contain", "Submitted");

      // Review form
      cy.contains('[data-cy="forms-panel-block"]', "My Form")
        .find('[data-cy="review-form-button"]')
        .should("exist");
    });
  });

  it("Save form as a draft, then submitting", () => {
    cy.wrap(["admin", "approved"]).each((permission_level) => {
      cy.logout();
      cy.login_by_permission(permission_level);
      cy.visit("/snack/forms");

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
      cy.get('[data-cy="active-form-modal"]')
        .find("button")
        .contains("Save")
        .should("be.disabled");

      // Type into the textarea
      cy.get('[data-cy="active-form-modal"]')
        .find("textarea")
        .type("Hello, how are you?");

      // Save the form
      cy.get('[data-cy="active-form-modal"]')
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
      cy.get('[data-cy="active-form-modal"]')
        .find("textarea")
        .should("have.value", "Hello, how are you?")
        .type(" I'm doing well.")
        .should("have.value", "Hello, how are you? I'm doing well.");

      // Submit the form
      cy.get('[data-cy="active-form-modal"]')
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
      cy.get('[data-cy="panel-tabs"]').find("a").contains("All").click();

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

      cy.get('[data-cy="active-form-modal"]')
        .find("textarea")
        .should("be.disabled");

      cy.get('[data-cy="close-form"]').click();

      // Check submitted tab
      cy.get('[data-cy="panel-tabs"]').find("a").contains("Submitted").click();

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

  it("Unreleased form is viewable as an admin", () => {
    // Confirm that the forms are loaded prior to continuing
    cy.get('[data-cy="forms-panel-block"]').should(
      "not.contain",
      "No forms here"
    );

    cy.contains('[data-cy="forms-panel-block"]', "Unreleased Form")
      .find('[data-cy="status-tag"]')
      .should("contain", "Not Started");

    // Click to launch the Simple Form
    cy.contains('[data-cy="forms-panel-block"]', "Unreleased Form")
      .find('[data-cy="launch-form-button"]')
      .click();

    // Assert that this is the simple form
    cy.get('[data-cy="active-form-title"]').should(
      "contain",
      "Unreleased Form"
    );
  });
});

describe("Forms viewed as a user", () => {
  beforeEach(() => {
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
