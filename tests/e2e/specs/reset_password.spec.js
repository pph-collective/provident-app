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
    cy.intercept("POST", "http://localhost:9099/**", {
      statusCode: 200,
      body: {
        requestType: "PASSWORD_RESET",
        email: `${accounts.approved.email}`
      }
    }).as("password-email-reset-request");

    cy.get('[type="email"]').type(`${accounts.approved.email}`);
    cy.get('[data-cy="reset-password"]').click();

    // assert that a matching successful password reset request has been made
    cy.wait("@password-email-reset-request").then(req => {
      cy.log(req);
    });

    cy.get('[data-cy="alert"]').should(
      "contain",
      "Success. Check your email to reset your password."
    );
  });
});
