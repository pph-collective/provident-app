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
    cy.registerUser({
      email: "register@register.com",
      name: "First Last",
      organization: "Good Doers",
      password: "register-password",
    });

    // Try to log in
    cy.get("[data-cy='login-button']").click();
    cy.get('[type="email"]').type(testUser.email);
    cy.get('[type="password"]').type(`${testUser.password}{enter}`);
    cy.get('[data-cy="error-message"]')
      .should("exist")
      .contains("User account not approved: pending");
  });

  it("Email is already in use", () => {
    cy.get("[data-cy='login-button']").click();
    cy.get("[data-cy='request-access-button']").click();

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
