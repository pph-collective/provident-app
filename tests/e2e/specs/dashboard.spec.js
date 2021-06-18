describe("Dashboard viewed as a user", () => {
  beforeEach(() => {
    cy.logout();
    cy.task("db:teardown");
    cy.task("db:seed");
    cy.login_by_permission("approved");
    cy.visit("/snack/dashboard");
  });

  it("Has a control panel with limited dropdowns", () => {
    cy.get('[data-cy="control-panel"]')
      .find("select")
      .should("have.length", "2")
      .eq(0)
      .find("option")
      .then(options => {
        const actual = [...options].map(o => o.text);
        expect(actual).to.deep.eq(["Good Doers", "All of Rhode Island"]);
      });
  });

  describe("Changes map on geography drop down", () => {
    it("is All of Rhode Island", () => {
      cy.get("select#geography").select("All of Rhode Island");

      cy.get(".map-container .vega-embed svg")
        .trigger("mouseover", "center")
        .trigger("mousemove", "center");

      cy.get("#vg-tooltip-element")
        .find("tbody tr")
        .first()
        .find("td.value")
        .should("have.text", "North Kingstown");
    });

    it("is Good Doers", () => {
      cy.get("select#geography").select("Good Doers");
      cy.wait(200);

      cy.get(".map-container .vega-embed svg")
        .trigger("mouseover", "center")
        .trigger("mousemove", "center");

      cy.get("#vg-tooltip-element")
        .find("tbody tr")
        .first()
        .find("td.value")
        .should("have.text", "Portsmouth");
    });
  });
});

describe("Dashboard viewed as an admin", () => {
  beforeEach(() => {
    cy.logout();
    cy.task("db:teardown");
    cy.task("db:seed");
    cy.login_by_permission("admin");
    cy.visit("/snack/dashboard");
  });

  it("Has a control panel with all dropdowns", () => {
    cy.get('[data-cy="control-panel"]')
      .find("select")
      .eq(0)
      .find("option")
      .then(options => {
        const actual = [...options].map(o => o.text);
        expect(actual).to.deep.eq([
          "All of Rhode Island",
          "Good Doers",
          "RI 4 Us"
        ]);
      });
  });
});
