describe("Register User", () => {
  beforeEach(() => {
    cy.task("db:deleteUserByEmail", "register@register.com");
    cy.visit("/register");
  });

  it("Request Access Header", () => {
    cy.contains("h1", "Request Access").should("exist");
  });

  it("Request Access Submit Button Disabled", () => {
    cy.get(".button")
      .contains("Request Access")
      .should("be.disabled");
  });

  it("Submit valid form", () => {
    cy.get('[type="email"]').type("register@register.com");
    cy.get("#form-name").type("First Last");
    cy.get("#form-organization").select("Good Doers");
    cy.get("#form-password").type("register-password");
    cy.get("#form-confirm-password").type("register-password");

    cy.get(".button")
      .contains("Request Access")
      .should("be.enabled");
    cy.get("form").submit();
    cy.get('[data-cy="error-message"]').should("not.exist");
  });

  it("Email is already in use", () => {
    cy.get('[type="email"]').type("admin@admin.com");
    cy.get("#form-name").type("First Last");
    cy.get("#form-organization").select("Good Doers");
    cy.get("#form-password").type("register-password");
    cy.get("#form-confirm-password").type("register-password");

    cy.get(".button")
      .contains("Request Access")
      .should("be.enabled");
    cy.get("form").submit();
    cy.get('[data-cy="error-message"]').should(
      "contain",
      "The email address is already in use by another account."
    );
  });
});
