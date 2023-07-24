describe("Form functionality", () => {
  beforeEach(() => {
    cy.login_by_permission("admin").then(() => {
      cy.get("[data-cy='forms']").click();
      cy.waitLoaded('[data-cy="forms-table-body"]');

      // Form Page Loaded
      cy.get('[data-cy="forms-table-body"]')
        .find("tr")
        .should("not.have.length", 0);
    });
  });

  it("Trying to submit an empty form, then closing it without saving", () => {
    cy.get('[data-cy="forms-table-body"]')
      .contains("tr", "My Form")
      .find(".tag")
      .should("contain", "Not Started");

    cy.get('[data-cy="forms-table-body"]')
      .contains("tr", "My Form")
      .find("[data-cy='launch-form-button']")
      .click();

    cy.get('[data-cy="active-form-modal"]').should("exist");
    cy.get('[data-cy="active-form-title"]').should("contain", "My Form");
    // block group map should not be rendered since form doesn't have block group
    cy.get(".vega-embed").should("not.exist");

    // Try to submit the form
    cy.get('[data-cy="active-form-modal"]')
      .find("button")
      .contains("Submit")
      .click();

    cy.get('[data-cy="active-form-modal"]').should("exist");
    cy.get('[data-cy="close-form"]').click();

    cy.get('[data-cy="forms-table-body"]')
      .contains("tr", "My Form")
      .find(".tag")
      .should("contain", "Not Started");
  });

  it("Submitting a valid user form, My Form", () => {
    cy.wrap(["admin", "approved"]).each((permission_level) => {
      cy.logout();
      cy.login_by_permission(permission_level);
      cy.get("[data-cy='forms']").click();
      cy.waitLoaded('[data-cy="forms-table-body"]');

      cy.get('[data-cy="forms-table-body"]')
        .contains("tr", "My Form")
        .find(".tag")
        .should("contain", "Not Started");

      cy.get('[data-cy="forms-table-body"]')
        .contains("tr", "My Form")
        .find("[data-cy='launch-form-button']")
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
      cy.get('[model="favorite_color"]')
        .find(".multiselect")
        .click()
        .find(".multiselect-option")
        .contains("Green")
        .click();

      cy.get('[model="other_favorite_color"]').should("not.exist");

      // Other Favorite Color
      cy.get('[model="favorite_color"]')
        .find(".multiselect")
        .click()
        .find(".multiselect-option")
        .contains("Other")
        .click();

      cy.get('[model="other_favorite_color"]')
        .should("exist")
        .find("input")
        .type("all of them");

      // Essay about favorite color
      cy.get('[model="color_essay"]')
        .find("textarea")
        .type("I can't decide on a single color.");

      // Checkbox
      cy.get('[model="checkbox_mammals"]')
        .find("li")
        .contains("Cat")
        .find('[type="checkbox"]')
        .check();

      cy.get('[model="checkbox_mammals"]')
        .find("li")
        .contains("Elephant")
        .find('[type="checkbox"]')
        .check();

      cy.get('[model="checkbox_mammals"]')
        .find("li")
        .contains("Salmon")
        .find('[type="checkbox"]')
        .check();

      cy.get('[model="checkbox_mammals"]')
        .find("li")
        .contains("Salmon")
        .find('[type="checkbox"]')
        .uncheck();

      // LikertScale test different clicks
      cy.get('[model="likert_scale_food_debates"]')
        .find("tr")
        .eq(1)
        .find('[data-label="Agree"]')
        .click();

      cy.get('[model="likert_scale_food_debates"]')
        .find("tr")
        .eq(2)
        .find('[data-label="Neutral"] > input')
        .click();

      // LikertScale test changing answers
      cy.get('[model="likert_scale_activities"]')
        .find("tr")
        .eq(1)
        .find('[data-label="Sometimes"]')
        .click();

      cy.get('[model="likert_scale_activities"]')
        .find("tr")
        .eq(1)
        .find('[data-label="Never"]')
        .click();

      cy.get('[model="likert_scale_activities"]')
        .find("tr")
        .eq(2)
        .find('[data-label="Sometimes"]')
        .click();

      // Change answer!
      cy.get('[model="likert_scale_activities"]')
        .find("tr")
        .eq(2)
        .find('[data-label="Rarely"]')
        .click();

      // SAVE
      cy.get('[data-cy="active-form-modal"]')
        .find("button")
        .contains("Save")
        .should("be.enabled")
        .click();

      // CLOSE
      cy.get('[data-cy="close-form"]').click();

      // REOPEN
      cy.get('[data-cy="forms-table-body"]')
        .contains("tr", "My Form")
        .find('[data-cy="launch-form-button"]')
        .click();

      // Change answer!
      cy.get('[model="likert_scale_activities"]')
        .find("tr")
        .eq(1)
        .find('[data-label="Rarely"]')
        .click();

      // SAVE
      cy.get('[data-cy="active-form-modal"]')
        .find("button")
        .contains("Save")
        .should("be.enabled")
        .click();

      // Submit the form
      cy.get('[data-cy="active-form-modal"]')
        .find("button")
        .contains("Submit")
        .should("be.enabled")
        .click();

      cy.get('[data-cy="active-form-modal"]').should("not.exist");

      // Check form status
      cy.get('[data-cy="forms-table-body"]')
        .contains("tr", "My Form")
        .find(".tag")
        .should("contain", "Submitted");

      cy.get('[data-cy="forms-table-body"]')
        .contains("tr", "My Form")
        .find("launch-form-button")
        .should("not.exist");

      // Review form
      cy.get('[data-cy="forms-table-body"]')
        .contains("tr", "My Form")
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
        .find(".multiselect")
        .should("have.css", "pointer-events", "none");

      cy.get('[model="other_favorite_color"]')
        .should("exist")
        .find("input")
        .should("be.disabled")
        .should("have.value", "all of them");

      cy.get('[model="checkbox_mammals"]')
        .should("exist")
        .find("input")
        .should("be.disabled");

      cy.get('[model="checkbox_mammals"]')
        .find("li")
        .contains("Cat")
        .find('[type="checkbox"]')
        .should("be.checked");

      cy.get('[model="checkbox_mammals"]')
        .find("li")
        .contains("Elephant")
        .find('[type="checkbox"]')
        .should("be.checked");

      cy.get('[model="checkbox_mammals"]')
        .find("li")
        .contains("Salmon")
        .find('[type="checkbox"]')
        .should("not.be.checked");

      cy.get('[model="likert_scale_food_debates"]')
        .should("exist")
        .find("input")
        .should("be.disabled");

      cy.get('[model="likert_scale_food_debates"]')
        .find("tr")
        .eq(1)
        .find('[data-label="Agree"] > input')
        .should("be.checked");

      cy.get('[model="likert_scale_food_debates"]')
        .find("tr")
        .eq(2)
        .find('[data-label="Neutral"] > input')
        .should("be.checked");

      cy.get('[model="likert_scale_activities"]')
        .should("exist")
        .find("input")
        .should("be.disabled");

      cy.get('[model="likert_scale_activities"]')
        .find("tr")
        .eq(1)
        .find('[data-label="Sometimes"] > input')
        .should("not.be.checked");

      cy.get('[model="likert_scale_activities"]')
        .find("tr")
        .eq(1)
        .find('[data-label="Never"] > input')
        .should("not.be.checked");

      cy.get('[model="likert_scale_activities"]')
        .find("tr")
        .eq(1)
        .find('[data-label="Rarely"] > input')
        .should("be.checked");

      cy.get('[model="likert_scale_activities"]')
        .find("tr")
        .eq(2)
        .find('[data-label="Sometimes"] > input')
        .should("not.be.checked");

      // Change answer!
      cy.get('[model="likert_scale_activities"]')
        .find("tr")
        .eq(2)
        .find('[data-label="Rarely"] > input')
        .should("be.checked");

      // Close form
      cy.get('[data-cy="close-form"]').click();
    });
  });

  it("Save form as a draft, then submitting", () => {
    cy.wrap(["admin", "approved"]).each((permission_level) => {
      cy.logout();
      cy.login_by_permission(permission_level);
      cy.get("[data-cy='forms']").click();
      cy.waitLoaded('[data-cy="form-panel"]');

      // Confirm that the forms are loaded prior to continuing
      cy.get('[data-cy="forms-panel-block"]').should(
        "not.contain",
        "No forms here"
      );

      cy.contains('[data-cy="forms-panel-block"]', "Simple Form")
        .find(".tag")
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
        .type("Hello, world.");

      // try to close without saving
      let alerted = false;
      cy.on("window:confirm", (str) => {
        expect(str).to.equal(
          "Are you sure you want to close the form? You have unsaved changes."
        );
        alerted = true;
        return false;
      });

      cy.get("body")
        .type("{esc}")
        .then(() => expect(alerted).to.be.true);

      alerted = false;
      cy.get("button.delete")
        .click()
        .then(() => expect(alerted).to.be.true);

      // Save the form
      cy.get('[data-cy="active-form-modal"]')
        .find("button")
        .contains("Save")
        .should("be.enabled")
        .click();

      // Save button should be disabled
      cy.get('[data-cy="active-form-modal"]')
        .find("button")
        .contains("Save")
        .should("be.disabled");

      // Type into the textarea
      cy.get('[data-cy="active-form-modal"]')
        .find("textarea")
        .clear()
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
      cy.contains('[data-cy="forms-panel-block"]', "Simple Form")
        .find(".tag")
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

      cy.get('[data-cy="active-form-modal"]').should("not.exist");

      // Check form
      cy.contains('[data-cy="forms-panel-block"]', "Simple Form")
        .find(".tag")
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
    });
  });

  describe("filters forms", () => {
    beforeEach(() => {
      cy.get('[data-cy="forms-panel-block"]').should("have.length", 5);
    });

    it("title", () => {
      cy.contains("div", "Title ").click();
      cy.contains(".multiselect-option", "My Form").click();
      cy.get('[data-cy="forms-panel-block"]').should("have.length", 1);
    });

    it("status", () => {
      cy.contains("div", "Status ").click();
      cy.contains(".multiselect-option", "Not Started").click();
      cy.get('[data-cy="forms-panel-block"]').should("have.length", 5);
      cy.contains("div", "Status ").click();
      cy.contains(".multiselect-option", "Not Started").click();
      cy.contains("div", "Status ").click();
      cy.contains(".multiselect-option", "Draft").click();
      cy.get('[data-cy="forms-panel-block"]')
        .should("have.length", 1)
        .should("contain", "No forms here");
    });
  });
});

describe("Forms viewed as an admin", () => {
  beforeEach(() => {
    cy.login_by_permission("admin").then(() => {
      cy.get("[data-cy='forms']").click();
      cy.waitLoaded('[data-cy="form-panel"]');
    });
  });

  it("Release date is viewable as an admin", () => {
    cy.get('[data-cy="forms-panel-block"]').should(
      "not.contain",
      "No forms here"
    );
    cy.get(".tag").should("exist").should("contain", "2021-10-13");
  });

  it("Unreleased form is viewable as an admin", () => {
    // Confirm that the forms are loaded prior to continuing
    cy.get('[data-cy="forms-panel-block"]').should(
      "not.contain",
      "No forms here"
    );

    cy.contains('[data-cy="forms-panel-block"]', "Unreleased Form")
      .find(".tag")
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

    cy.get('[data-cy="close-form"]').click();
  });

  it("Followup forms", () => {
    const now = Date.now();
    const day_in_ms = 86400000;

    const tomorrow = new Date(now + day_in_ms).toLocaleDateString("sv");
    const day_after_tomorrow = new Date(now + 2 * day_in_ms)
      .toISOString()
      .split("T")[0];

    cy.contains('[data-cy="forms-panel-block"]', "Original Form")
      .find('[data-cy="launch-form-button"]')
      .click();

    // Assert that this is the simple form
    cy.get('[data-cy="active-form-title"]').should("contain", "Original Form");

    // Fill out form
    cy.get('[model="favorite_color"]')
      .find("textarea")
      .should("be.enabled")
      .type("blue");

    cy.get('[model="favorite_animal"]')
      .find("textarea")
      .should("be.enabled")
      .type("giraffe");

    cy.get('[data-cy="active-form-modal"]')
      .find("button")
      .contains("Submit")
      .click();

    cy.get('[data-cy="active-form-modal"]').should("not.exist");

    // Check the followup form
    cy.contains('[data-cy="forms-panel-block"]', "Original Form")
      .should("exist")
      .find(".tag")
      .should("contain", "Submitted");

    cy.contains('[data-cy="forms-panel-block"]', "Followup Form")
      .should("exist")
      .find(".tag")
      .should("contain", "Not Started");

    // Check release date
    cy.contains('[data-cy="forms-panel-block"]', "Followup Form")
      .should("exist")
      .find(".tag")
      .should("contain", `RELEASE DATE: ${tomorrow}`);

    cy.contains('[data-cy="forms-panel-block"]', "Followup Form")
      .find('[data-cy="launch-form-button"]')
      .click();

    // Assert form is the Followup Form
    cy.get('[data-cy="active-form-title"]').should("contain", "Followup Form");

    // Fill out form
    cy.get('[model="favorite_color"]')
      .find("textarea")
      .should("be.disabled")
      .should("have.value", "blue");

    cy.get('[model="second_favorite_color"]').find("textarea").type("green");

    cy.get('[model="favorite_animal"]')
      .find("textarea")
      .should("be.disabled")
      .should("have.value", "giraffe");

    cy.get('[model="second_favorite_animal"]').find("textarea").type("whale");

    cy.get('[data-cy="active-form-modal"]')
      .find("button")
      .contains("Submit")
      .click();

    cy.get('[data-cy="active-form-modal"]').should("not.exist");

    // Check the followup form
    cy.contains('[data-cy="forms-panel-block"]', "Followup Form")
      .should("exist")
      .find(".tag")
      .should("contain", "Submitted");

    // Check the followup to the followup form
    cy.contains(
      '[data-cy="forms-panel-block"]',
      "Followup to the followup form"
    )
      .should("exist")
      .find(".tag")
      .should("contain", "Not Started");

    // Check release date
    cy.contains(
      '[data-cy="forms-panel-block"]',
      "Followup to the followup form"
    )
      .should("exist")
      .find(".tag")
      .should("contain", `RELEASE DATE: ${day_after_tomorrow}`);

    cy.contains(
      '[data-cy="forms-panel-block"]',
      "Followup to the followup form"
    )
      .find('[data-cy="launch-form-button"]')
      .click();

    // Assert that this is the followup to the followup form
    cy.get('[data-cy="active-form-title"]').should(
      "contain",
      "Followup to the followup form"
    );

    cy.get('[model="second_favorite_color"]')
      .find("textarea")
      .should("be.disabled")
      .should("have.value", "green");

    cy.get('[model="second_favorite_animal"]')
      .find("textarea")
      .should("be.disabled")
      .should("have.value", "whale");

    cy.get('[model="favorite_movie"]')
      .find("textarea")
      .should("exist")
      .should("be.enabled")
      .type("all of them");

    cy.get('[data-cy="active-form-modal"]')
      .find("button")
      .contains("Submit")
      .click();

    cy.get('[data-cy="active-form-modal"]').should("not.exist");

    // Review the followup to the followup form
    cy.contains(
      '[data-cy="forms-panel-block"]',
      "Followup to the followup form"
    )
      .should("exist")
      .find(".tag")
      .should("contain", "Submitted");

    cy.contains(
      '[data-cy="forms-panel-block"]',
      "Followup to the followup form"
    )
      .find('[data-cy="review-form-button"]')
      .should("exist")
      .click();

    cy.get('[model="second_favorite_color"]')
      .find("textarea")
      .should("be.disabled")
      .should("have.value", "green");

    cy.get('[model="second_favorite_animal"]')
      .find("textarea")
      .should("be.disabled")
      .should("have.value", "whale");

    cy.get('[model="favorite_movie"]')
      .find("textarea")
      .should("be.disabled")
      .should("have.value", "all of them");

    // Close form
    cy.get('[data-cy="close-form"]').click();
  });
});

describe("Forms viewed as a user", () => {
  beforeEach(() => {
    cy.login_by_permission("approved").then(() => {
      cy.get("[data-cy='forms']").click();
      cy.waitLoaded('[data-cy="form-panel"]');
    });
  });

  it("Form title heading", () => {
    cy.get('[data-cy="form-panel-heading"]').should("not.be.empty");
  });

  it("Release date is not viewable as a user", () => {
    cy.get(".tag").contains("RELEASE DATE").should("not.exist");
  });

  it("Released forms should be viewable and see status", () => {
    cy.contains('[data-cy="forms-panel-block"]', "My Form")
      .should("exist")
      .find(".tag")
      .should("contain", "Not Started");

    cy.contains('[data-cy="forms-panel-block"]', "Simple Form")
      .should("exist")
      .find(".tag")
      .should("contain", "Not Started");
  });

  it("Unreleased forms should not be viewable", () => {
    cy.contains('[data-cy="forms-panel-block"]', "Unreleased Form").should(
      "not.exist"
    );
  });

  it("Organization-level forms are are read only", () => {
    cy.contains('[data-cy="forms-panel-block"]', "Sample Organization Form")
      .should("exist")
      .find(".tag")
      .should("contain", "Not Started");

    cy.contains('[data-cy="forms-panel-block"]', "Sample Organization Form")
      .find('[data-cy="review-form-button"]')
      .should("exist")
      .click();

    cy.get('[model="resources"]')
      .find("textarea")
      .should("exist")
      .should("be.disabled");

    cy.get('[data-cy="close-form"]').click();
  });
});

describe("Forms viewed as a champion", () => {
  beforeEach(() => {
    cy.login_by_permission("champion").then(() => {
      cy.get("[data-cy='forms']").click();
      cy.waitLoaded('[data-cy="form-panel"]');
    });
  });

  it("Organization-level forms are listed", () => {
    // wait for status tag to load before trying to launch the form
    cy.contains('[data-cy="forms-panel-block"]', "Sample Organization Form")
      .should("exist")
      .find(".tag")
      .should("contain", "Not Started");

    cy.contains('[data-cy="forms-panel-block"]', "Sample Organization Form")
      .should("exist")
      .find('[data-cy="launch-form-button"]')
      .should("exist");
  });

  it("Drafting a organization-level form is editable by champion and viewable by user", () => {
    // wait for status tag to load before trying to launch the form
    cy.contains('[data-cy="forms-panel-block"]', "Sample Organization Form")
      .should("exist")
      .find(".tag")
      .should("contain", "Not Started");

    cy.contains('[data-cy="forms-panel-block"]', "Sample Organization Form")
      .should("exist")
      .find('[data-cy="launch-form-button"]')
      .click();

    cy.get('[model="resources"]')
      .find("textarea")
      .should("be.enabled")
      .type("water");

    cy.get('[data-cy="active-form-modal"]')
      .find("button")
      .contains("Save")
      .click();

    // Save button should be disabled
    cy.get('[data-cy="active-form-modal"]')
      .find("button")
      .contains("Save")
      .should("be.disabled");

    // Form message
    cy.get('[data-cy="form-message"]').should(
      "contain",
      "Form successfully saved"
    );

    // Close form
    cy.get('[data-cy="close-form"]').click();

    // Assert Status: Draft
    cy.contains('[data-cy="forms-panel-block"]', "Sample Organization Form")
      .find(".tag")
      .should("contain", "Draft");

    // Reopen
    // Click to launch the Sample Organization Form
    cy.contains('[data-cy="forms-panel-block"]', "Sample Organization Form")
      .find('[data-cy="launch-form-button"]')
      .click();

    // Check if textarea is saved and if editable
    cy.get('[data-cy="active-form-modal"]')
      .find("textarea")
      .should("have.value", "water");

    cy.get('[data-cy="close-form"]').click();

    // Log out and log in as a user
    cy.logout();
    cy.login_by_permission("approved").then(() => {
      cy.get("[data-cy='forms']").click();
      cy.waitLoaded('[data-cy="form-panel"]');
    });

    cy.contains('[data-cy="forms-panel-block"]', "Sample Organization Form")
      .should("exist")
      .find(".tag")
      .should("contain", "Draft");

    cy.contains('[data-cy="forms-panel-block"]', "Sample Organization Form")
      .find('[data-cy="review-form-button"]')
      .should("exist")
      .click();

    cy.get('[model="resources"]')
      .find("textarea")
      .should("exist")
      .should("be.disabled")
      .should("have.value", "water");

    cy.get('[data-cy="close-form"]').click();
  });

  it("Submitting an organization-level form", () => {
    // wait for status tag to load before trying to launch the form
    cy.contains('[data-cy="forms-panel-block"]', "Sample Organization Form")
      .should("exist")
      .find(".tag")
      .should("contain", "Not Started");

    cy.contains('[data-cy="forms-panel-block"]', "Sample Organization Form")
      .should("exist")
      .find('[data-cy="launch-form-button"]')
      .click();

    cy.get('[model="resources"]')
      .find("textarea")
      .should("be.enabled")
      .type("water");

    cy.get('[data-cy="active-form-modal"]')
      .find("button")
      .contains("Submit")
      .click();

    cy.contains('[data-cy="forms-panel-block"]', "Sample Organization Form")
      .should("exist")
      .find(".tag")
      .should("contain", "Submitted");

    cy.contains('[data-cy="forms-panel-block"]', "Sample Organization Form")
      .find('[data-cy="review-form-button"]')
      .should("exist")
      .click();

    cy.get('[model="resources"]')
      .find("textarea")
      .should("exist")
      .should("be.disabled")
      .should("have.value", "water");

    cy.get('[data-cy="close-form"]').click();

    // Log out and log in as a user to view the form
    cy.logout();
    cy.login_by_permission("approved").then(() => {
      cy.get("[data-cy='forms']").click();
      cy.waitLoaded('[data-cy="form-panel"]');
    });

    cy.contains('[data-cy="forms-panel-block"]', "Sample Organization Form")
      .should("exist")
      .find(".tag")
      .should("contain", "Submitted");

    cy.contains('[data-cy="forms-panel-block"]', "Sample Organization Form")
      .find('[data-cy="review-form-button"]')
      .should("exist")
      .click();

    cy.get('[model="resources"]')
      .find("textarea")
      .should("exist")
      .should("be.disabled")
      .should("have.value", "water");

    cy.get('[data-cy="close-form"]').click();
  });
});

describe("Forms edited by multiple uses", () => {
  const formTitle = "Sample Organization Form";

  beforeEach(() => {
    cy.login_by_permission("champion").then(() => {
      cy.get("[data-cy='forms']").click();
      cy.waitLoaded('[data-cy="form-panel"]');
    });

    cy.contains('[data-cy="forms-panel-block"]', formTitle)
      .should("exist")
      .find('[data-cy="launch-form-button"]')
      .click();

    cy.get('[model="resources"]')
      .find("textarea")
      .should("be.enabled")
      .type("water");

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
    cy.get('[data-cy="active-form-modal"]').should("not.exist");
    cy.get('[data-cy="launch-form-button"]').should("exist");

    cy.logout();
    cy.login_by_permission("championAlt").then(() => {
      cy.get("[data-cy='forms']").click();
      cy.waitLoaded('[data-cy="form-panel"]');
    });

    cy.contains('[data-cy="forms-panel-block"]', formTitle)
      .should("exist")
      .find('[data-cy="launch-form-button"]')
      .click();

    cy.get('[data-cy="active-form-modal"]')
      .find(".user-submitted")
      .should("not.contain", "Submitted by")
      .should("contain", "Edited by championuser@user.com");

    cy.get('[model="resources"]')
      .find("textarea")
      .should("be.enabled")
      .should("have.value", "water")
      .clear()
      .type("water and fire");

    // Submit the form
    cy.get('[data-cy="active-form-modal"]')
      .find("button")
      .contains("Submit")
      .should("be.enabled")
      .click();

    cy.get('[data-cy="active-form-modal"]').should("not.exist");
  });

  it("Submitted by and Edited by tags", () => {
    cy.contains('[data-cy="forms-panel-block"]', "Sample Organization Form")
      .find(".tag")
      .should("contain", "SUBMITTED BY: championalt@user.com");

    // Review form
    cy.contains('[data-cy="forms-panel-block"]', formTitle)
      .find('[data-cy="review-form-button"]')
      .should("exist")
      .click();

    cy.get('[data-cy="active-form-modal"]')
      .find(".user-submitted")
      .should("contain", "Submitted by championalt@user.com")
      .should(
        "contain",
        "Edited by championuser@user.com, championalt@user.com"
      );

    cy.get('[data-cy="close-form"]').click();
    cy.get('[data-cy="active-form-modal"]').should("not.exist");
  });
});
