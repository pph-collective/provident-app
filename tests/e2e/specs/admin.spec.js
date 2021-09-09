import ACCOUNTS from "../../fixtures/accounts.json";

describe("Admin Views and Powers", () => {
  beforeEach(() => {
    cy.login_by_permission("admin");
    cy.visit("/admin");
  });

  it("navigation bar to /admin", () => {
    cy.get('[data-cy="admin"]')
      .should("exist")
      .should("have.attr", "href", "/admin");
  });

  it("Review Access Requests header", () => {
    cy.contains("h1", "Review Access Requests");
  });

  it("View pending users", () => {
    cy.contains('[data-cy="user-request"]', ACCOUNTS.pending.email).should(
      "exist"
    );
  });

  it("Approving a user", () => {
    cy.contains('[data-cy="user-request"]', ACCOUNTS.pending.email)
      .get('[data-cy="approve"]')
      .should("exist")
      .click();

    cy.get(".loading-icon").should("not.exist");

    cy.get('[data-cy="alert-message"]')
      .should("exist")
      .should("contain", `Success! ${ACCOUNTS.pending.email} was approved`);

    // Try to log in
    cy.logout();
    cy.visit("/login");
    cy.get('[type="email"]').type(ACCOUNTS.pending.email);
    cy.get('[type="password"]').type(`${ACCOUNTS.pending.password}{enter}`);
    cy.url().should("eq", Cypress.config().baseUrl);
    cy.get("a").contains("Log Out").should("exist");

    // Navigate to forms, there should be an assigned form
    cy.visit("/snack/forms");
    cy.get(".loading-icon").should("not.exist");

    cy.get('[data-cy="form-panel-heading"]').should("not.be.empty");

    // Confirm that forms are loaded prior to continuing
    cy.get(".loading-icon").should("not.exist");
    cy.get('[data-cy="forms-panel-block"]').should(
      "not.contain",
      "No forms here"
    );

    cy.get('[data-cy="forms-panel-block"]:contains("Simple Form")')
      .should("have.length", 1)
      .find('[data-cy="status-tag"]')
      .should("contain", "Not Started");

    cy.contains('[data-cy="forms-panel-block"]', "Simple Form")
      .find('[data-cy="launch-form-button"]')
      .click();

    cy.get('[data-cy="active-form-modal"]').should("exist");
    cy.get('[data-cy="active-form-title"]').should("contain", "Simple Form");
  });

  it("Denying a user", () => {
    cy.contains('[data-cy="user-request"]', ACCOUNTS.pending.email)
      .get('[data-cy="deny"]')
      .should("exist")
      .click();
    cy.get('[data-cy="alert-message"]')
      .should("exist")
      .should("contain", `${ACCOUNTS.pending.email} was denied`);

    // Try to log in as the denied user
    cy.logout();
    cy.visit("/login");
    cy.get('[type="email"]').type(ACCOUNTS.pending.email);
    cy.get('[type="password"]').type(`${ACCOUNTS.pending.password}{enter}`);
    cy.get('[data-cy="error-message"]')
      .should("exist")
      .contains("User account not approved: denied");
  });

  it("User management", () => {
    cy.get('a[href="/admin/user_management"]').click();
    cy.get(".loading-icon").should("not.exist");
    cy.get("table tbody tr").should("have.length", 4).first().find("i").click();
    cy.get("table tbody tr").find("select").should("have.value", "champion");
    cy.get("table tbody tr").find("select").select("user");
    cy.get("table tbody tr").first().find("i.fa-save").click();
    cy.get("table tbody tr")
      .first()
      .find('td[data-cy="role"]')
      .should("contain", "user");

    // still there after hard refresh
    cy.visit("/admin/user_management");
    cy.get("h1.title").should("contain", "User Management");
    cy.get(".loading-icon").should("not.exist");
    cy.get("table tbody tr")
      .first()
      .find('td[data-cy="role"]')
      .should("contain", "user");

    cy.get("table thead input").first().type("asdf");
    cy.get("table tbody tr")
      .should("have.length", 1)
      .find("td")
      .should("contain", "No users found");
  });
});
