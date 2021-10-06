import ACCOUNTS from "../../fixtures/accounts.json";
import { resetDatabase } from "../support";

describe("Admin Views and Powers", () => {
  beforeEach(() => {
    cy.login_by_permission("admin");
    cy.get("[data-cy='admin']").click();
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

    cy.get(".notification")
      .should("exist")
      .should("contain", `Success! ${ACCOUNTS.pending.email} was approved`);

    cy.get('a[href="/admin/email"]').click();
    cy.get(".loading-icon").should("not.exist");

    cy.get(".email-row .level-item").should(
      "contain",
      "TEST: PROVIDENT Access Approved"
    );

    // Try to log in
    cy.logout();
    cy.get("[data-cy='login-button']").click();
    cy.get('[type="email"]').type(ACCOUNTS.pending.email);
    cy.get('[type="password"]').type(`${ACCOUNTS.pending.password}{enter}`);
    cy.url().should("eq", Cypress.config().baseUrl);
    cy.get("a").contains("Log Out").should("exist");

    // Navigate to forms, there should be an assigned form
    cy.get('[data-cy="forms"]').click();
    cy.get('[data-cy="form-panel"]').should("exist");
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
      .find(".tag")
      .should("contain", "Not Started");

    cy.contains('[data-cy="forms-panel-block"]', "Simple Form")
      .find('[data-cy="launch-form-button"]')
      .click();

    cy.get('[data-cy="active-form-modal"]').should("exist");
    cy.get('[data-cy="active-form-title"]').should("contain", "Simple Form");
    cy.get("textarea").type("{esc}");
  });

  it("Denying a user", () => {
    cy.contains('[data-cy="user-request"]', ACCOUNTS.pending.email)
      .get('[data-cy="deny"]')
      .should("exist")
      .click();
    cy.get(".notification")
      .should("exist")
      .should("contain", `${ACCOUNTS.pending.email} was denied`);

    // Try to log in as the denied user
    cy.logout();
    cy.get("[data-cy='login-button']").click();
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

  describe("emails", () => {
    beforeEach(() => {
      cy.get('a[href="/admin/email"]').click();
      cy.get(".loading-icon").should("not.exist");
    });

    it("has no emails to start", () => {
      cy.get(".panel-block").should("contain", "No emails here");
    });

    it("can compose an email", () => {
      cy.get("button#compose-button").click();
      cy.get(".modal-card-title").should("contain", "Compose Email");
      cy.get("[model='target_groups']")
        .find(".multiselect")
        .click()
        .contains(".multiselect-option", "control")
        .click();
      cy.get("[model='send_date']").find("input").type("2021-12-12");
      cy.get("[model='subject']").find("input").type("A test email");
      cy.get("[model='body']").find("textarea").type("<p>Hello, world</p>");

      cy.get("#email-preview .message-header").should("contain", "subject");
      cy.get("#email-preview .message-body").should(
        "contain",
        "body of the email"
      );

      cy.get("button").contains("Preview").click();

      cy.get("#email-preview .message-header").should(
        "contain",
        "A test email"
      );
      cy.get("#email-preview .message-body").should("contain", "Hello, world");

      cy.get("button").contains("Submit").click();

      cy.get(".email-row").contains("A test email").should("exist");
      cy.get(".email-row").contains("span", "2021-12-12").should("exist");
      cy.get(".email-row")
        .find(".tag")
        .should("have.length", 3)
        .should("contain", "admin@admin.com");
    });
  });

  describe("Organization Management", () => {
    const testUser = {
      email: "test@user.com",
      name: "Test User",
      organization: "Test Organization",
      password: "user-password",
    };

    const resetTest = () => {
      cy.task("auth:deleteUserByEmail", testUser.email);
      cy.reload(); // Refresh store
    };

    beforeEach(() => {
      resetTest();
      cy.get('a[href="/admin/organization_management"]').click();
      cy.get('[data-cy="organization-table"]').should(
        "not.contain",
        "No organizations found"
      );
      cy.get(".loading-icon").should("not.exist");
    });

    after(() => {
      resetDatabase();
      resetTest();
    });

    it("Page loads", () => {
      cy.get('[data-cy="organization-table"]').should(
        "not.contain",
        "No organizations found"
      );

      cy.get('[data-cy="organization-table"]')
        .contains("td", "Good Doers")
        .should("exist");

      cy.get('[data-cy="organization-table"]')
        .contains("td", "RI 4 Us")
        .should("exist");
    });

    it("Creating an intervention organization", () => {
      cy.get('[data-cy="create-button"]').should("exist").click();

      cy.get('[model="name"]').type("good doers");
      cy.get('[model="name"]')
        .find(".has-text-danger")
        .should("contain", "Organization already exists");

      cy.get('[model="name"]').clear().type(testUser.organization);

      cy.get('[model="group"]').find("input").first().check();

      cy.get('[model="municipalities"]')
        .find(".multiselect")
        .click()
        .find(".multiselect-option")
        .contains(/^Providence$/)
        .click();

      cy.get('[model="municipalities"]')
        .find(".multiselect")
        .click()
        .find(".multiselect-option")
        .contains("Little Compton")
        .click();

      cy.get("button").contains("Submit").click();
      cy.get('[data-cy="active-form-modal"]').should("not.exist");
      cy.get(".loading-icon").should("not.exist");

      // Check that it exists on the page
      cy.get('[data-cy="organization-table"]')
        .contains("td", testUser.organization)
        .should("exist");

      cy.registerUser(testUser);
      cy.approveUser(testUser.email);

      // Log in as test user
      cy.logout();
      cy.login(testUser.email, testUser.password);
      // Navigate to form
      cy.get('[data-cy="forms"]').click();
      cy.get('[data-cy="form-panel"]').should("exist");
      cy.get(".loading-icon").should("not.exist");

      cy.get('[data-cy="panel-tabs"]')
        .find("a")
        .contains("Organization-level")
        .click();

      cy.contains('[data-cy="forms-panel-block"]', "Sample Organization Form")
        .find('[data-cy="review-form-button"]')
        .should("exist")
        .click();

      cy.get('[data-cy="active-form-modal"]').should("exist");
      cy.get('[data-cy="active-form-title"]').should(
        "contain",
        "Sample Organization Form"
      );
      cy.get('[data-cy="close-form"]').click();
    });

    it("Creating a control organization without forms", () => {
      cy.get('[data-cy="create-button"]').should("exist").click();

      cy.get('[model="name"]').clear().type(testUser.organization);

      cy.get('[model="group"]').find("input").eq(1).check();

      cy.get('[model="municipalities"]')
        .find(".multiselect")
        .click()
        .find(".multiselect-option")
        .contains(/^Providence$/)
        .click();

      cy.get("button").contains("Submit").click();
      cy.get('[data-cy="active-form-modal"]').should("not.exist");
      cy.get(".loading-icon").should("not.exist");

      // Check that it exists on the page
      cy.get('[data-cy="organization-table"]')
        .contains("td", testUser.organization)
        .should("exist");

      cy.registerUser(testUser);
      cy.approveUser(testUser.email);

      // Log in as test user
      cy.logout();
      cy.login(testUser.email, testUser.password);
      // Navigate to forms
      cy.get('[data-cy="forms"]').click();
      cy.get('[data-cy="form-panel"]').should("exist");
      cy.get(".loading-icon").should("not.exist");

      cy.get('[data-cy="panel-tabs"]')
        .find("a")
        .contains("Organization-level")
        .click();

      cy.get('[data-cy="forms-panel-block"]')
        .find("Sample Organization Form")
        .should("not.exist");
    });
  });
});
