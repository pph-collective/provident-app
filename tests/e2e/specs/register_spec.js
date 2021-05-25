describe("Register User", () => {
  beforeEach(() => {
    // TODO: Call db:teardown and db:seed from plugins/index.js prior to tests
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

  // it("Requires passwords are the same", () => {
  //
  // });

  it("Submit valid form", () => {
    cy.get('[type="email"]').type("register@register.com");
    cy.get("#form-name").type("First Last");
    // Select an organization
    cy.get("#form-organization").select("Good Doers");
    cy.get("#form-password").type("register-password");
    cy.get("#form-confirm-password").type("register-password");

    cy.get(".button")
      .contains("Request Access")
      .should("be.enabled");
    cy.get("form").submit();
  });

  // it("Email is already in use", () => {
  //
  // });
});
