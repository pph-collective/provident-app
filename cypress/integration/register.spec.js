import ACCOUNTS from "../fixtures/accounts.json";

describe("Register User", () => {
  const testUser = {
    email: "register@register.com",
    name: "First Last",
    organization: "Good Doers",
    password: "register-password",
  };

  beforeEach(() => {
    cy.task("auth:deleteUserByEmail", testUser.email);
    cy.get("[data-cy='login-button']").click();
    cy.get("[data-cy='request-access-button']").click();
  });

  it("Request Access Header", () => {
    cy.contains("h1", "Request Access").should("exist");
  });

  it("Request Access Submit Button Disabled", () => {
    cy.get('[data-cy="request-access-button"]').should("be.disabled");
  });

  it("Submit valid form", () => {
    cy.registerUser(testUser);

    // Try to log in
    cy.get("[data-cy='login-button']").click();
    cy.get('[type="email"]').type(testUser.email);
    cy.get('[type="password"]').type(`${testUser.password}{enter}`);
    cy.get('[data-cy="error-message"]')
      .should("exist")
      .contains("User account not approved: pending");
  });

  it("Email is already in use", () => {
    cy.get('[type="email"]').type("user@user.com");
    cy.get('[data-cy="form-name"]').type("First Last");
    cy.get('[data-cy="form-organization"]').select("Good Doers");
    cy.get('[data-cy="form-password"]').type("register-password");
    cy.get('[data-cy="form-confirm-password"]').type("register-password");
    cy.get('[data-cy="form-terms-and-conditions"]').click();
    cy.get('[data-cy="form-terms-law-enforcement"]').click();
    cy.get('[data-cy="form-terms-metadata"]').click();

    cy.get('[data-cy="request-access-button"]').should("be.enabled");
    cy.get("form").submit();
    cy.get('[data-cy="error-message"]').should(
      "contain",
      "The email address is already in use by another account."
    );
  });

  it("Logging in from the register page", () => {
    // Navigate to login
    cy.get("[data-cy='login-button']").click();

    // Assert that the url doesn't have a redirect back to the register page
    cy.url().should("eq", `${Cypress.config().baseUrl}login`);

    // Log in
    cy.get('[type="email"]').type(ACCOUNTS.approved.email);
    cy.get('[type="password"]').type(`${ACCOUNTS.approved.password}{enter}`);

    // Assert logged in
    cy.url().should("eq", Cypress.config().baseUrl);
    cy.get('[data-cy="logout-button"]').should("exist");
  });
});
