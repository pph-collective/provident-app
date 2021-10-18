describe("Dashboard viewed as a user", () => {
  beforeEach(() => {
    cy.login_by_permission("champion");
    cy.get("[data-cy='dashboard']").click();
    cy.get(".dashboard").should("exist");
    cy.get(".loading-icon", { timeout: 10000 }).should("not.exist");
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
      .should("have.length", "2")
      .eq(1)
      .find("option")
      .then((options) => {
        const actual = [...options].map((o) => o.text);
        expect(actual).to.deep.eq(["2019-1", "2018-2"]);
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
        .trigger("click", "center");

      cy.get("#vg-tooltip-element")
        .find("tbody tr")
        .first()
        .find("td.value")
        .should("have.text", "Portsmouth");

      cy.get("#vg-tooltip-element")
        .find("tbody tr")
        .last()
        .find("td.key")
        .should("have.text", "Flag:");

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

  it("has a neighborhood rapid assessment widget", () => {
    // when nothing is selected, the correct message is shown, no table
    cy.get("#nra-widget .form-response-container p").should(
      "have.text",
      "Select a block group on the map to see its completed assessments or start a new one"
    );

    // when something is selected with no assessments, correct message is shown, no table
    cy.get("select#geography").select("Good Doers");

    cy.get(".map-container [data-cy='Good Doers'] svg")
      .trigger("mouseover", "center")
      .trigger("mousemove", "center")
      .trigger("click", "center");

    cy.get("#nra-widget .form-response-container p").should(
      "contain",
      "No Assessments Found for 0401021"
    );

    // fill out a form partially, save, table shown
    cy.get("#nra-widget button#new-assessment").click();

    cy.get("[data-cy='active-form-title']").should(
      "contain",
      "Neighborhood Rapid Assessment"
    );

    cy.get("[model='neighborhood_id']")
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

    cy.get('[data-cy="close-form"]').click();

    cy.get("#nra-widget .form-response-container table tbody tr")
      .should("have.length", 2)
      .find("button")
      .first()
      .should("have.text", "Continue")
      .click();

    // still has correct id and still disabled
    cy.get("[model='neighborhood_id']")
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
});

describe("Dashboard viewed as a control arm user", () => {
  beforeEach(() => {
    cy.login_by_permission("control");
    cy.get("[data-cy='dashboard']").click();
    cy.get(".dashboard").should("exist");
    cy.get(".loading-icon", { timeout: 10000 }).should("not.exist");
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
      .trigger("click", "center");

    cy.get("#vg-tooltip-element")
      .find("tbody tr")
      .first()
      .find("td.value")
      .should("have.text", "Tiverton");

    cy.get("#vg-tooltip-element")
      .find("tbody tr")
      .last()
      .find("td.key")
      .should("not.have.text", "Flag:");

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

    // no tooltip should be visible (zoomed map is not interactive)
    cy.get("#vg-tooltip-element").should("not.have.class", "visible");

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
    cy.get(".dashboard").should("exist");
    cy.get(".loading-icon", { timeout: 10000 }).should("not.exist");
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
