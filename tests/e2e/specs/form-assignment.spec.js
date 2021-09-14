const selectForm = (formTitle) => {
  cy.get(".loading-icon").should("not.exist");
  cy.get('[data-cy="create-button"]').should("exist").click();

  cy.get('[model="form_id"]')
    .find(".multiselect")
    .click()
    .contains(".multiselect-option", formTitle)
    .click();
};

/**
 * Sets the release date to today and the expire date to 3000-01-01
 */
const setDatesAndSubmit = () => {
  const today = new Date().toISOString().split("T")[0]; // Date to ISO string without time
  cy.get('[model="release_date"]').find("input").type(today);
  cy.get('[model="expire_date"]').find("input").type("3000-01-01");

  cy.get('[data-cy="form-assignment-modal"]')
    .contains("button", "Submit")
    .click();

  cy.get('[data-cy="form-message"]').should("not.exist");

  cy.get(".loading-icon").should("not.exist");

  cy.get('[data-cy="form-assignment-modal"]').should("not.exist");

  cy.get('[data-cy="alert-message"]')
    .should("exist")
    .should("contain", "form assignment added");

  cy.get(".loading-icon").should("not.exist");
};

const checkFormAssignedInToDos = (permission, formTitle, should) => {
  cy.logout();
  cy.login_by_permission(permission).then(() => {
    cy.get("[data-cy='snack']").click();
    cy.get("a[href='/snack/forms']").click();
    cy.get('[data-cy="form-panel"]').should("exist");
    cy.get(".loading-icon").should("not.exist");
  });

  cy.contains('[data-cy="forms-panel-block"]', formTitle).should(should);

  if (should === "exist") {
    cy.contains('[data-cy="forms-panel-block"]', formTitle)
      .find(".tag")
      .should("contain", "Not Started");

    cy.contains('[data-cy="forms-panel-block"]', formTitle)
      .find('[data-cy="launch-form-button"]')
      .click();

    cy.get('[data-cy="active-form-modal"]').should("exist");
    cy.get('[data-cy="active-form-title"]').should("contain", formTitle);
  }
};

describe("Form Assignment functionality", () => {
  beforeEach(() => {
    cy.login_by_permission("admin").then(() => {
      cy.get("[data-cy='admin']").click();
      cy.get("a[href='/admin/form_assignments']").click();
      cy.get(".form-assignments").should("exist");
      cy.get(".loading-icon").should("not.exist");
    });
  });

  it("Form Assignments Page Loads", () => {
    cy.get(".panel-heading").should("contain", "Form Assignments");
    cy.get('[data-cy="create-button"]').should("exist");

    cy.contains('[data-cy="form-assignment-panel-block"]', "My Form")
      .find(".tag")
      .should("contain", "2021-05-21");

    cy.contains('[data-cy="form-assignment-panel-block"]', "My Form")
      .find(".tag")
      .should("contain", "3000-09-09");

    cy.contains('[data-cy="form-assignment-panel-block"]', "My Form")
      .find(".tags")
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

  it("Assign Organization Form to All", () => {
    selectForm("Organization Assigned Form");
    // Cannot be assigned to users
    cy.get('[model="target_users"]').should("not.exist");

    cy.get('[model="target_groups"]')
      .find(".multiselect")
      .click()
      .contains(".multiselect-option", "all")
      .click();

    setDatesAndSubmit();

    // Admin is in RI 4 Us
    checkFormAssignedInToDos("admin", "Organization Assigned Form", "exist");

    // Champion is in Good Doers
    checkFormAssignedInToDos("champion", "Organization Assigned Form", "exist");
  });

  it("Assign Organization Form to RI 4 Us and Good Doers", () => {
    selectForm("Organization Assigned Form");
    // Cannot be assigned to users
    cy.get('[model="target_users"]').should("not.exist");

    cy.get('[model="target_organizations"]')
      .find(".multiselect")
      .click()
      .contains(".multiselect-option", "RI 4 Us")
      .click();

    cy.get('[model="target_organizations"]')
      .find(".multiselect")
      .click()
      .contains(".multiselect-option", "Good Doers")
      .click();

    setDatesAndSubmit();

    // Admin is in Ri 4 Us
    checkFormAssignedInToDos("admin", "Organization Assigned Form", "exist");

    // Champion is in Good Doers
    checkFormAssignedInToDos("champion", "Organization Assigned Form", "exist");
  });

  it("Assign Organization Form to intervention and control groups", () => {
    selectForm("Organization Assigned Form");
    // Cannot be assigned to users
    cy.get('[model="target_users"]').should("not.exist");

    cy.get('[model="target_groups"]')
      .find(".multiselect")
      .click()
      .contains(".multiselect-option", "intervention")
      .click();

    cy.get('[model="target_groups"]')
      .find(".multiselect")
      .click()
      .contains(".multiselect-option", "control")
      .click();

    setDatesAndSubmit();

    // Admin is in control group
    checkFormAssignedInToDos("admin", "Organization Assigned Form", "exist");

    // Champion is in the intervention group
    checkFormAssignedInToDos("champion", "Organization Assigned Form", "exist");
  });

  it("Assign Organization Form to intervention group and RI 4 Us", () => {
    selectForm("Organization Assigned Form");
    // Cannot be assigned to users
    cy.get('[model="target_users"]').should("not.exist");

    cy.get('[model="target_groups"]')
      .find(".multiselect")
      .click()
      .contains(".multiselect-option", "intervention")
      .click();

    cy.get('[model="target_organizations"]')
      .find(".multiselect")
      .click()
      .contains(".multiselect-option", "RI 4 Us")
      .click();

    setDatesAndSubmit();

    // Admin is in RI for Us
    checkFormAssignedInToDos("admin", "Organization Assigned Form", "exist");

    // Champion is in the intervention group
    checkFormAssignedInToDos("champion", "Organization Assigned Form", "exist");
  });

  it("Assign Organization Form to the control group", () => {
    selectForm("Organization Assigned Form");
    // Cannot be assigned to users
    cy.get('[model="target_users"]').should("not.exist");

    cy.get('[model="target_groups"]')
      .find(".multiselect")
      .click()
      .contains(".multiselect-option", "control")
      .click();

    setDatesAndSubmit();

    cy.contains(
      '[data-cy="form-assignment-panel-block"]',
      "Organization Assigned Form"
    )
      .find(".tag")
      .should("contain", "3000-01-01");

    // Admin is in the control group
    checkFormAssignedInToDos("admin", "Organization Assigned Form", "exist");

    // Champion is in the intervention group
    checkFormAssignedInToDos(
      "champion",
      "Organization Assigned Form",
      "not.exist"
    );
  });

  it("Assign User Form to All", () => {
    selectForm("User Assigned Form (type: user)");
    // Can be assigned to users
    cy.get('[model="target_users"]').should("exist");

    cy.get('[model="target_groups"]')
      .find(".multiselect")
      .click()
      .contains(".multiselect-option", "all")
      .click();

    setDatesAndSubmit();

    checkFormAssignedInToDos("admin", "User Assigned Form", "exist");
    checkFormAssignedInToDos("approved", "User Assigned Form", "exist");
    checkFormAssignedInToDos("control", "User Assigned Form", "exist");
    checkFormAssignedInToDos("champion", "User Assigned Form", "exist");
  });

  it("Assign User Form to intervention and control groups", () => {
    selectForm("User Assigned Form (type: user)");
    // Can be assigned to users
    cy.get('[model="target_users"]').should("exist");

    cy.get('[model="target_groups"]')
      .find(".multiselect")
      .click()
      .contains(".multiselect-option", "intervention")
      .click();

    cy.get('[model="target_groups"]')
      .find(".multiselect")
      .click()
      .contains(".multiselect-option", "control")
      .click();

    setDatesAndSubmit();

    // Control
    checkFormAssignedInToDos("admin", "User Assigned Form", "exist");

    // Intervention
    checkFormAssignedInToDos("champion", "User Assigned Form", "exist");
  });

  it("Assign User Form to user, admin, and RI 4 Us", () => {
    selectForm("User Assigned Form (type: user)");
    // Can be assigned to users
    cy.get('[model="target_users"]').should("exist");

    cy.get('[model="target_users"]')
      .find(".multiselect")
      .click()
      .contains(".multiselect-option", "(user@user.com)")
      .click();

    cy.get('[model="target_users"]')
      .find(".multiselect")
      .click()
      .contains(".multiselect-option", "(admin@admin.com)")
      .click();

    cy.get('[model="target_organizations"]')
      .find(".multiselect")
      .click()
      .contains(".multiselect-option", "RI 4 Us")
      .click();

    setDatesAndSubmit();

    cy.get("[data-cy='snack']").click();
    cy.get("a[href='/snack/forms']").click();
    cy.get('[data-cy="form-panel"]').should("exist");
    cy.get(".loading-icon").should("not.exist");

    cy.get('[data-cy="form-panel-heading"]').should("not.be.empty");

    // Check that the admin only got one User Assigned Form
    // They are both in RI 4 Us and is listed in users to get the form.
    // Use contain within the cypress get function to get a list of all the elements that contain the text
    // The cypress contain function returns just the first element
    cy.get(
      '[data-cy="forms-panel-block"]:contains("User Assigned Form")'
    ).should("have.length", 1);

    cy.contains('[data-cy="forms-panel-block"]', "User Assigned Form")
      .find(".tag")
      .should("contain", "Not Started");

    checkFormAssignedInToDos("approved", "User Assigned Form", "exist");
    checkFormAssignedInToDos("control", "User Assigned Form", "exist");
    checkFormAssignedInToDos("champion", "User Assigned Form", "not.exist");
  });
});
