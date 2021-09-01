describe("Form Assignment functionality", () => {
  beforeEach(() => {
    cy.login_by_permission("admin").then(() => {
      cy.visit("/admin/form_assignments");
    });
  });

  it("Form Assignments Page Loads", () => {
    cy.get(".panel-heading").should("contain", "Form Assignments");
    cy.get('[data-cy="create-button"]').should("exist");

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

  it("Launch Form Assignment Form", () => {
    cy.get('[data-cy="create-button"]').click();
    cy.get('[data-cy="form-assignment-modal"]').should(
      "have.class",
      "is-active"
    );

    // Trying to submit an empty form
    cy.get('[data-cy="form-assignment-modal"]')
      .contains("button", "Submit")
      .click();

    // Check to make sure the modal didn't close and therefore didn't submit
    cy.get('[data-cy="form-assignment-modal"]').should(
      "have.class",
      "is-active"
    );
  });

  it("Assign Organization Form to Intervention Groups", () => {
    cy.get('[data-cy="create-button"]').click();

    cy.get('[model="form_id"]')
      .find(".multiselect")
      .click()
      .contains(
        ".multiselect-option",
        "Organization Assigned Form (type: organization)"
      )
      .click();

    // Cannot be assigned to users
    cy.get('[model="users"]').should("not.exist");

    cy.get('[model="groups"]')
      .find(".multiselect")
      .click()
      .contains(".multiselect-option", "control")
      .click();

    let today = new Date(); // Local time
    today = today.toISOString().split("T")[0]; // Date to ISO string without time
    cy.get('[model="release_date"]').find("input").type(today);
    cy.get('[model="expire_date"]').find("input").type("3000-01-01");

    cy.get('[data-cy="form-assignment-modal"]')
      .contains("button", "Submit")
      .click();

    cy.get('[data-cy="form-message"]').should("not.exist");

    cy.get('[data-cy="form-assignment-modal"]').should("not.exist");

    cy.get('[data-cy="alert-message"]')
      .should("exist")
      .should("contain", "form assignment added");

    cy.contains(
      '[data-cy="form-assignment-panel-block"]',
      "Organization Assigned Form"
    )
      .find('[data-cy="expire-date-tag"]')
      .should("contain", "3000-01-01");

    cy.visit("/snack/forms");
    it("Form title heading", () => {
      cy.get('[data-cy="form-panel-heading"]').should("not.be.empty");
    });

    cy.contains('[data-cy="forms-panel-block"]', "Organization Assigned Form")
      .find('[data-cy="status-tag"]')
      .should("contain", "Not Started");

    cy.contains('[data-cy="forms-panel-block"]', "Organization Assigned Form")
      .find('[data-cy="launch-form-button"]')
      .click();

    cy.get('[data-cy="active-form-modal"]').should("exist");
    cy.get('[data-cy="active-form-title"]').should(
      "contain",
      "Organization Assigned Form"
    );
  });

  it("Assign User Form - assign to user and RI 4 Us", () => {
    cy.get('[data-cy="create-button"]').should("exist").click();

    cy.get('[model="form_id"]')
      .find(".multiselect")
      .click()
      .contains(".multiselect-option", "User Assigned Form (type: user)")
      .click();

    // Can be assigned to users
    cy.get('[model="users"]').should("exist");

    cy.get('[model="users"]')
      .find(".multiselect")
      .click()
      .contains(".multiselect-option", "(user@user.com)")
      .click();

    cy.get('[model="organizations"]')
      .find(".multiselect")
      .click()
      .contains(".multiselect-option", "RI 4 Us")
      .click();

    let today = new Date(); // Local time
    today = today.toISOString().split("T")[0]; // Date to ISO string without time
    cy.get('[model="release_date"]').find("input").type(today);
    cy.get('[model="expire_date"]').find("input").type("3000-01-01");

    cy.get('[data-cy="form-assignment-modal"]')
      .contains("button", "Submit")
      .click();

    cy.get('[data-cy="form-message"]').should("not.exist");

    cy.get('[data-cy="form-assignment-modal"]').should("not.exist");

    cy.get('[data-cy="alert-message"]')
      .should("exist")
      .should("contain", "form assignment added");

    cy.visit("/snack/forms");
    it("Form title heading", () => {
      cy.get('[data-cy="form-panel-heading"]').should("not.be.empty");
    });

    cy.contains('[data-cy="forms-panel-block"]', "User Assigned Form")
      .find('[data-cy="status-tag"]')
      .should("contain", "Not Started");

    cy.logout();
    cy.login_by_permission("approved").then(() => {
      cy.visit("/snack/forms");
    });

    cy.get('[data-cy="forms-panel-block"]').should(
      "not.contain",
      "No forms here"
    );

    cy.contains('[data-cy="forms-panel-block"]', "User Assigned Form")
      .find('[data-cy="status-tag"]')
      .should("contain", "Not Started");

    cy.logout();
    cy.login_by_permission("control").then(() => {
      cy.visit("/snack/forms");
    });

    cy.get('[data-cy="forms-panel-block"]').should(
      "not.contain",
      "No forms here"
    );

    cy.contains('[data-cy="forms-panel-block"]', "User Assigned Form")
      .find('[data-cy="status-tag"]')
      .should("contain", "Not Started");

    cy.logout();
    cy.login_by_permission("champion").then(() => {
      cy.visit("/snack/forms");
    });

    cy.get('[data-cy="forms-panel-block"]').should(
      "not.contain",
      "No forms here"
    );

    cy.contains('[data-cy="forms-panel-block"]', "User Assigned Form").should(
      "not.exist"
    );
  });
});
