describe("Dashboard viewed as a user", () => {
  beforeEach(() => {
    cy.login_by_permission("approved");
    cy.visit("/snack/dashboard");
  });

  it("Has a control panel with limited dropdowns", () => {
    cy.get("#dashboard-control-panel")
      .find("select")
      .should("have.length", "2")
      .eq(0)
      .find("option")
      .should("have.lengthOf.above", 3)
      .then((options) => {
        const actual = [...options].map((o) => o.text);
        expect(actual).to.deep.eq([
          "Good Doers",
          "All of Rhode Island",
          "Little Compton",
          "Portsmouth",
          "Tiverton",
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
        .find("section div p")
        .first()
        .should("have.text", "Municipality: ");

      // ri should be filled
      cy.get("div#stats")
        .find("tbody tr td span")
        .first()
        .should("have.class", "has-text-success")
        .find("i")
        .should("have.class", "fa-arrow-alt-circle-right");

      // empty circle
      cy.get("div#stats")
        .find("tbody tr td span")
        .last()
        .should("have.class", "has-text-light")
        .find("i")
        .should("have.class", "fa-circle");

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
        .find("section div p")
        .first()
        .should("have.text", "Municipality: Portsmouth");

      // ri unchanged
      cy.get("div#stats")
        .find("tbody tr td span")
        .first()
        .should("have.class", "has-text-success")
        .find("i")
        .should("have.class", "fa-arrow-alt-circle-right");

      // empty circle now filled arrow
      cy.get("div#stats")
        .find("tbody tr td span")
        .last()
        .should("not.have.class", "has-text-light")
        .find("i")
        .should("have.class", "fa-arrow-alt-circle-right");
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
});

describe("Dashboard viewed as a control arm user", () => {
  beforeEach(() => {
    cy.login_by_permission("control");
    cy.visit("/snack/dashboard");
  });

  it("Has a control panel with all dropdowns", () => {
    cy.get("#dashboard-control-panel")
      .find("select")
      .eq(0)
      .find("option")
      .should("have.lengthOf.above", 4)
      .then((options) => {
        const actual = [...options].map((o) => o.text);
        expect(actual).to.deep.eq([
          "RI 4 Us",
          "All of Rhode Island",
          "Little Compton",
          "Portsmouth",
          "Tiverton",
        ]);
      });
  });

  it("is RI 4 Us", () => {
    cy.get("div#stats")
      .find("section div p")
      .first()
      .should("have.text", "Municipality: ");

    // ri should be filled
    cy.get("div#stats")
      .find("tbody tr td span")
      .first()
      .should("have.class", "has-text-success")
      .find("i")
      .should("have.class", "fa-arrow-alt-circle-right");

    // empty circle
    cy.get("div#stats")
      .find("tbody tr td span")
      .last()
      .should("have.class", "has-text-light")
      .find("i")
      .should("have.class", "fa-circle");

    cy.get("select#geography").select("RI 4 Us");

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
      .find("section div p")
      .first()
      .should("have.text", "Municipality: Tiverton");

    // ri unchanged
    cy.get("div#stats")
      .find("tbody tr td span")
      .first()
      .should("have.class", "has-text-success")
      .find("i")
      .should("have.class", "fa-arrow-alt-circle-right");

    // empty circle now filled arrow
    cy.get("div#stats")
      .find("tbody tr td span")
      .last()
      .should("not.have.class", "has-text-light")
      .find("i")
      .should("have.class", "fa-arrow-alt-circle-right");
  });
});

describe("Dashboard viewed as an admin", () => {
  beforeEach(() => {
    cy.login_by_permission("admin");
    cy.visit("/snack/dashboard");
  });

  it("Has a control panel with all dropdowns", () => {
    cy.get("#dashboard-control-panel")
      .find("select")
      .eq(0)
      .find("option")
      .should("have.lengthOf.above", 4)
      .then((options) => {
        const actual = [...options].map((o) => o.text);
        expect(actual).to.deep.eq([
          "All of Rhode Island",
          "Good Doers",
          "RI 4 Us",
          "Little Compton",
          "Portsmouth",
          "Tiverton",
        ]);
      });
  });
});
