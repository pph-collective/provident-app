describe("Register User", () => {
  beforeEach(() => {
    cy.task("auth:deleteUserByEmail", "register@register.com");
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
    cy.get('[type="email"]').type("register@register.com");
    cy.get('[data-cy="form-name"]').type("First Last");
    cy.get('[data-cy="form-organization"]').select("Good Doers");
    cy.get('[data-cy="form-password"]').type("register-password");
    cy.get('[data-cy="form-confirm-password"]').type("register-password");
    cy.get('[data-cy="form-terms"]').click();

    cy.get(".button").contains("Request Access").should("be.enabled");
    cy.get("form").submit();
    cy.get('[data-cy="error-message"]').should("not.exist");
    cy.get('[data-cy="success-message"]')
      .should("exist")
      .contains("Your request has been received.");

    // Try to log in
    cy.get("[data-cy='login-button']").click();
    cy.get('[type="email"]').type("register@register.com");
    cy.get('[type="password"]').type("register-password{enter}");
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
    cy.get('[data-cy="form-terms"]').click();

    cy.get('[data-cy="request-access-button"]').should("be.enabled");
    cy.get("form").submit();
    cy.get('[data-cy="error-message"]').should(
      "contain",
      "The email address is already in use by another account."
    );
  });
});
