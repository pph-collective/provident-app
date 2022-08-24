describe("Dashboard viewed as a user", () => {
  beforeEach(() => {
    cy.login_by_permission("champion");
    cy.get("[data-cy='dashboard']").click();
    cy.waitLoaded(".dashboard");
  });

  it("Has a control panel with limited dropdowns", () => {
    cy.get("#dashboard-control-panel")
      .find("select")
      .should("have.length", "2")
      .eq(0)
      .find("option")
      .should("have.length", 41)
      .then((options) => {
        const actual = [...options].map((o) => o.text);
        expect(actual.slice(0, 2)).to.deep.eq([
          "Good Doers",
          "All of Rhode Island",
        ]);
      });

    cy.get("#dashboard-control-panel")
      .find("select")
      .eq(1)
      .find("option")
      .should("have.length", 5)
      .then((options) => {
        const actual = [...options].map((o) => o.text);

        // Good Doers' zipcodes
        expect(actual).to.deep.eq([
          "All Zip Codes",
          "02837",
          "02871",
          "02872 (Prudence Island)",
          "02878",
        ]);
      });
  });

  it("Switching geography resets zipcodes", () => {
    cy.get("select#geography").select("All of Rhode Island");

    // Choose a zipcode
    cy.get("select#zipcode").select("02802 (Albion)");

    // Wait for zipcodes dropdown to update
    cy.get("select#zipcode")
      .find("option:selected")
      .should("have.text", "02802 (Albion)");

    // Switch to Little Compton
    cy.get("select#geography").select("Little Compton");

    // Wait for zipcodes dropdown to reset to all zip codes
    cy.get("select#zipcode")
      .find("option:selected")
      .should("have.text", "All Zip Codes");

    // Check Zipcode Dropdown
    cy.get("#dashboard-control-panel")
      .find("select")
      .eq(1)
      .find("option")
      .then((options) => {
        const actual = [...options].map((o) => o.text);
        expect(actual).to.deep.eq(["All Zip Codes", "02837"]);
      });
  });

  describe("Changes map and stats on geography drop down", () => {
    it("is All of Rhode Island", () => {
      cy.get("select#geography").select("All of Rhode Island");

      cy.get('.map-container [data-cy="All of Rhode Island"] svg')
        .trigger("mouseover", "center")
        .trigger("mousemove", "center");

      cy.get("#vg-tooltip-element")
        .find("tbody tr")
        .first()
        .find("td.value")
        .should("have.text", "North Kingstown");
    });

    it("is Good Doers", () => {
      cy.get("div#stats")
        .find("div.tags")
        .first()
        .should("have.text", "Municipality-");

      // ri should be filled
      cy.get("div#stats")
        .find("tbody tr")
        .first()
        .next() // first data row
        .find("td span")
        .last()
        .should("not.be.empty")
        .should("not.have.text", "-");

      // empty circle
      cy.get("div#stats")
        .find("tbody tr")
        .first()
        .next() // first data row
        .find("td span")
        .first()
        .should("not.be.empty")
        .should("have.text", "-");

      cy.get("select#geography").select("Good Doers");

      cy.get('.map-container [data-cy="Good Doers"] svg')
        .trigger("mouseover", "center")
        .trigger("mousemove", "center")
        .trigger("mousedown", "center");

      cy.get("#vg-tooltip-element")
        .find("tbody tr")
        .first()
        .find("td.value")
        .should("have.text", "Portsmouth");

      cy.get("#vg-tooltip-element")
        .contains("tbody tr", "Prediction:")
        .find("td.value")
        .should("have.text", "Not Prioritized");

      cy.get("div#stats")
        .find("div.tags")
        .first()
        .should("have.text", "MunicipalityPortsmouth");

      // ri should be filled
      cy.get("div#stats")
        .find("tbody tr")
        .first()
        .next() // first data row
        .find("td span")
        .last()
        .should("not.be.empty")
        .should("not.have.text", "-");

      // has data
      cy.get("div#stats")
        .find("tbody tr")
        .first()
        .next() // first data row
        .find("td span")
        .first()
        .should("not.be.empty")
        .should("not.have.text", "-");
    });

    it("is Little Compton", () => {
      cy.get("select#geography").select("Little Compton");

      cy.get('.map-container [data-cy="Little Compton"] svg')
        .trigger("mouseover", "center")
        .trigger("mousemove", "center");

      cy.get("#vg-tooltip-element")
        .find("tbody tr")
        .first()
        .find("td.value")
        .should("have.text", "Little Compton");
    });
  });

  describe("Assessment Widget", () => {
    beforeEach(() => {
      // when nothing is selected, the correct message is shown, no table
      cy.get("#nra-widget .form-response-container p").contains(
        /Select a block group on the map to see its completed assessments and plans or start a new one/
      );

      // when something is selected with no assessments, correct message is shown, no table
      cy.get("select#geography").select("Good Doers");

      cy.get(".map-container [data-cy='Good Doers'] svg")
        .trigger("mouseover", "center")
        .trigger("mousemove", "center")
        .trigger("mousedown", "center");

      cy.get("#nra-widget .form-response-container p").should(
        "contain",
        "No Assessments or Plans Found for 0401021"
      );
    });

    it("has a neighborhood rapid assessment widget", () => {
      // fill out a form partially, save, table shown
      cy.get("#nra-widget button#new-assessment").should("be.enabled").click();

      cy.get("[data-cy='active-form-title']").should(
        "contain",
        "Neighborhood Rapid Assessment"
      );

      // block group map should be rendered
      cy.get(".vega-embed").should("exist");

      cy.get("[model='bg_id']")
        .find("input")
        .should("be.disabled")
        .should("have.value", "0401021");

      cy.get("[model='q2_other_related_services']")
        .find("textarea")
        .type("Lots of resources");

      cy.get("button").contains("Save").click();

      cy.get('[data-cy="close-form"]').click();

      cy.get("#nra-widget .form-response-container table tbody tr")
        .should("have.length", 1)
        .find("button")
        .should("have.text", "Continue");

      // fill out another form partially, save, two rows
      cy.get("#nra-widget button#new-assessment").click();

      cy.get("[data-cy='active-form-title']").should(
        "contain",
        "Neighborhood Rapid Assessment"
      );

      cy.get("[model='q2_other_related_services']")
        .find("textarea")
        .type("Lots of resources");

      cy.get("button").contains("Save").click();

      // Form message
      cy.get('[data-cy="form-message"]').should(
        "contain",
        "Form successfully saved"
      );

      cy.get('[data-cy="close-form"]').click();

      cy.get("#nra-widget .form-response-container table tbody tr")
        .should("have.length", 2)
        .find("button")
        .first()
        .should("have.text", "Continue")
        .click();

      // still has correct id and still disabled
      cy.get("[model='bg_id']")
        .find("input")
        .should("be.disabled")
        .should("have.value", "0401021");

      // fill out form completely, row switches to review
      cy.get("button").contains("Submit").click();
      cy.get("[data-cy='active-form-title']").should("not.exist");

      cy.get("#nra-widget .form-response-container table tbody tr")
        .should("have.length", 2)
        .find("button")
        .first()
        .should("have.text", "Review");

      // fill out form save, then submit, only one row for this action
      cy.get("#nra-widget button#new-assessment").click();

      cy.get("[model='q2_other_related_services']")
        .find("textarea")
        .type("Lots of resources");

      cy.get("button").contains("Save").click();

      cy.get("#nra-widget .form-response-container table tbody tr")
        .should("have.length", 3)
        .find("button")
        .first()
        .should("have.text", "Continue");

      cy.get("button").contains("Submit").click();

      cy.get("#nra-widget .form-response-container table tbody tr")
        .should("have.length", 3)
        .find("button")
        .first()
        .should("have.text", "Review");
    });

    it("has a plan form", () => {
      cy.get("#nra-widget button#new-plan").should("exist").click();

      cy.get("[data-cy='active-form-title']").should(
        "contain",
        "Six Month Resource Planning"
      );

      // block group map should be rendered
      cy.get(".vega-embed").should("exist");

      cy.get("[model='bg_id']")
        .find("input")
        .should("be.disabled")
        .should("have.value", "0401021");

      cy.get("[model='goal']").find("textarea").type("first goal");

      cy.get("button").contains("Save").click();

      // Form message
      cy.get('[data-cy="form-message"]').should(
        "contain",
        "Form successfully saved"
      );

      cy.get('[data-cy="close-form"]').click();

      cy.get('[data-cy="form-response-row"]')
        .find("td")
        .should("contain", "Plan");

      cy.get('[data-cy="form-response-row"]')
        .should("have.length", 1)
        .find("button")
        .should("have.text", "Continue")
        .click();

      cy.get('[model="goal"]')
        .should("have.length", 1)
        .find("textarea")
        .should("have.value", "first goal");

      // Add a goal
      cy.get("button").contains("+ Goal").click();

      cy.get('[model="goal"]').should("have.length", 2);

      // Add a 2 tasks to the first goal, check number of tasks to goal
      cy.get('[model="task_form"]')
        .first()
        .find('[data-cy="sub-form-button"]')
        .contains("+ Task")
        .click();
      cy.get('[model="task_form"]')
        .first()
        .find('[data-cy="sub-form-button"]')
        .contains("+ Task")
        .click();
      cy.get('[model="task_form"]')
        .first()
        .find('[model="plan"]')
        .should("have.length", 3);
      cy.get('[model="task_form"]')
        .eq(1)
        .find('[model="plan"]')
        .should("have.length", 1);

      // First Goal, fill out tasks
      // Task 1
      cy.get('[model="task_form"]')
        .first()
        .find('[model="plan"]')
        .first()
        .find(".multiselect")
        .click()
        .find(".multiselect-option")
        .first()
        .click();
      cy.get('[model="task_form"]')
        .first()
        .find('[model="person"]')
        .first()
        .type("Person 1");

      // Task 2
      cy.get('[model="task_form"]')
        .first()
        .find('[model="plan"]')
        .eq(1)
        .find(".multiselect")
        .click()
        .find(".multiselect-option")
        .eq(1)
        .click();

      cy.get('[model="task_form"]')
        .first()
        .find('[model="person"]')
        .eq(1)
        .type("Person 2.");

      // Delete task 3
      cy.get('[model="task_form"]')
        .first()
        .find('[data-cy="delete-sub-form-button"]')
        .eq(2)
        .click();

      // Second Goal
      cy.get('[model="goal"]').eq(1).type("second goal");
      cy.get('[model="task_form"]')
        .eq(1)
        .find('[model="plan"]')
        .find(".multiselect")
        .click()
        .find(".multiselect-option")
        .eq(1)
        .click();

      cy.get('[model="task_form"]')
        .eq(1)
        .find('[model="person"]')
        .type("Another person");
      // Try to delete task
      cy.get('[model="task_form"]')
        .eq(1)
        .find('[data-cy="delete-sub-form-button"]')
        .should("be.disabled");

      // Submit
      cy.get("button").contains("Submit").click();

      cy.get('[data-cy="form-response-row"]')
        .should("have.length", 1)
        .find("button")
        .should("have.text", "Review")
        .click();

      // Check
      cy.get('[data-cy="active-form-modal"]:visible')
        .find('[model="goal"]')
        .should("have.length", 2);
      cy.get('[model="task_form"]')
        .first()
        .find('[model="plan"]')
        .should("have.length", 2);
      cy.get('[model="task_form"]')
        .eq(1)
        .find('[model="plan"]')
        .should("have.length", 1);

      cy.get('[model="task_form"]')
        .first()
        .find('[model="plan"]')
        .first()
        .find(".multiselect-single-label")
        .should("have.text", "Increasing an existing service");
      cy.get('[model="task_form"]')
        .eq(1)
        .find('[model="plan"]')
        .first()
        .find(".multiselect-single-label")
        .should("have.text", "Creating a new service");

      cy.get('[data-cy="close-form"]').click();
    });
  });
});

describe("Dashboard viewed as a control arm user", () => {
  beforeEach(() => {
    cy.login_by_permission("control");
    cy.get("[data-cy='dashboard']").click();
    cy.waitLoaded(".dashboard");
  });

  it("Has a control panel with all dropdowns", () => {
    cy.get("#dashboard-control-panel")
      .find("select")
      .eq(0)
      .find("option")
      .should("have.length", 41)
      .then((options) => {
        const actual = [...options].map((o) => o.text);
        expect(actual.slice(0, 2)).to.deep.eq([
          "RI 4 Us",
          "All of Rhode Island",
        ]);
      });
  });

  it("is RI 4 Us", () => {
    cy.get("div#stats")
      .find("div.tags")
      .first()
      .should("have.text", "Municipality-");

    // ri should be filled
    cy.get("div#stats")
      .find("tbody tr")
      .first()
      .next() // first data row
      .find("td span")
      .last()
      .should("not.be.empty");

    // empty data
    cy.get("div#stats")
      .find("tbody tr")
      .first()
      .next() // first data row
      .find("td span")
      .first()
      .should("have.text", "-");

    cy.get("select#geography").select("RI 4 Us");

    cy.get(".zoom-button").should("be.disabled");

    cy.get('.map-container [data-cy="RI 4 Us"] svg')
      .trigger("mouseover", "center")
      .trigger("mousemove", "center")
      .trigger("mousedown", "center");

    cy.get("#vg-tooltip-element")
      .find("tbody tr")
      .first()
      .find("td.value")
      .should("have.text", "Tiverton");

    cy.get("#vg-tooltip-element")
      .contains("tbody tr", "Prediction:")
      .should("not.exist");

    cy.get("div#stats")
      .find("div.tags")
      .first()
      .should("have.text", "MunicipalityTiverton");

    cy.get("div#stats")
      .find("tbody tr")
      .first()
      .next() // first data row
      .find("td span")
      .last()
      .should("not.be.empty")
      .should("not.have.text", "-");

    // empty data now have data
    cy.get("div#stats")
      .find("tbody tr")
      .first()
      .next() // first data row
      .find("td span")
      .first()
      .should("not.be.empty")
      .should("not.have.text", "-");

    // move mouse out of the way
    cy.get('.map-container [data-cy="RI 4 Us"] svg').trigger(
      "mouseout",
      "center"
    );

    // zoom button enabled, zoom in!
    cy.get(".zoom-button").should("not.be.disabled").click();

    // try to trigger tooltip
    cy.get(".map-container #bg-zoom-map svg")
      .trigger("mouseover", "center")
      .trigger("mousemove", "center");

    // no tooltip should be visible in the center
    cy.get("#vg-tooltip-element").should("not.have.class", "visible");

    // find a tooltip on a specific landmark
    cy.get(".map-container #bg-zoom-map svg")
      .trigger("mouseover", 35, 280)
      .trigger("mousemove", 35, 280);

    cy.get("#vg-tooltip-element").should("have.class", "visible");

    cy.get("#vg-tooltip-element")
      .contains("h2", "Nanaquaket Yoga Studio")
      .should("exist");

    cy.get("#vg-tooltip-element")
      .contains("tbody tr", "Address")
      .find("td.value")
      .should("have.text", "2490 Main Rd, Tiverton, RI 02878");

    cy.get("#vg-tooltip-element")
      .contains("tbody tr", "Category")
      .find("td.value")
      .should("have.text", "Other Amusement and Recreation Industries");

    cy.get("#vg-tooltip-element")
      .contains("tbody tr", "Rank")
      .find("td.value")
      .should("have.text", "2");

    // Move the mouse back to the center
    cy.get(".map-container #bg-zoom-map svg")
      .trigger("mouseover", "center")
      .trigger("mousemove", "center");

    // zoom back out
    cy.get(".zoom-button").should("not.be.disabled").click();

    // should get a tooltip again
    cy.get('.map-container [data-cy="RI 4 Us"] svg')
      .trigger("mouseover", "center")
      .trigger("mousemove", "center");

    cy.get("#vg-tooltip-element").should("have.class", "visible");
  });

  it("has an assessment widget without start button", () => {
    cy.get("#nra-widget button").should("not.exist");
  });
});

describe("Dashboard viewed as an admin", () => {
  beforeEach(() => {
    cy.login_by_permission("admin");
    cy.get("[data-cy='dashboard']").click();
    cy.waitLoaded(".dashboard");
  });

  it("Has a control panel with all dropdowns", () => {
    cy.get("#dashboard-control-panel")
      .find("select")
      .eq(0)
      .find("option")
      .should("have.length", 42)
      .then((options) => {
        const actual = [...options].map((o) => o.text);
        expect(actual.slice(0, 3)).to.deep.eq([
          "All of Rhode Island",
          "Good Doers",
          "RI 4 Us",
        ]);
      });
  });
});
