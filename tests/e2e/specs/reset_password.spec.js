import accounts from "../../fixtures/accounts.json";

describe("Reset Password", () => {
  beforeEach(() => {
    cy.logout();
    cy.task("db:teardown");
    cy.task("db:seed");
    cy.visit("/login");
  });

  it("Submit empty email", () => {
    cy.get('[data-cy="reset-password"]').click();
    cy.get('[data-cy="error-message"]').should(
      "contain",
      "Enter an email and then click reset password."
    );
  });

  it("Submit not an email", () => {
    cy.get('[type="email"]').type("not an email");
    cy.get('[data-cy="reset-password"]').click();
    cy.get('[data-cy="error-message"]').should(
      "contain",
      "Enter an email and then click reset password."
    );
  });

  it("Reset invalid email", () => {
    cy.get('[type="email"]').type("doesnotexist@doesnotexist.com");
    cy.get('[data-cy="reset-password"]').click();
    cy.get('[data-cy="error-message"]').should(
      "contain",
      "There is no user record corresponding to this identifier. The user may have been deleted."
    );
  });

  it("Reset a password for an account that does exist", () => {
    cy.get('[type="email"]').type(`${accounts.approved.email}`);

    // Verify the email was sent
    // Reset the password
    // Log in with new password
  });
});
