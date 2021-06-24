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
    // Intercept the password email reset request
    cy.intercept(
      "POST",
      "http://localhost:9099/www.googleapis.com/identitytoolkit/v3/relyingparty/getOobConfirmationCode?**",
      req => {
        // Assert the request
        expect(req.body.requestType).to.equal("PASSWORD_RESET");
        expect(req.body.email).to.equal(accounts.approved.email);

        // Asset the response
        req.continue(res => {
          expect(res.statusCode).to.equal(200);
        });
      }
    ).as("password-email-reset-request");

    // User types in email and clicks reset password
    cy.get('[type="email"]').type(accounts.approved.email);
    cy.get('[data-cy="reset-password"]').click();

    // Getting pass this wait asserts that that a request of this type happened
    // User was sent an email
    cy.wait("@password-email-reset-request").then(req => {
      cy.log(req);
    });

    // Assert notification to user
    cy.get('[data-cy="alert"]').should(
      "contain",
      "Success. Check your email to reset your password."
    );

    // Get the oobCode
    cy.request(
      "GET",
      "http://localhost:9099/emulator/v1/projects/provident-ri/oobCodes"
    ).as("oobCodes-request");

    cy.get("@oobCodes-request").then(res => {
      cy.log(res);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("oobCodes");
      expect(res.body.oobCodes).to.not.be.empty;

      const oobCode = res.body.oobCodes[res.body.oobCodes.length - 1];
      expect(oobCode.email).to.equal(accounts.approved.email);
      expect(oobCode.requestType).to.equal("PASSWORD_RESET");
      expect(oobCode.oobCode).to.exist;

      // Use the oobCode to then go reset password!
      // navigate to /auth?mode=resetPassword&oobCode=??????
      cy.visit(`/auth?mode=resetPassword&oobCode=${oobCode.oobCode}`);

      // assert redirect to /updatePassword
      cy.url().should(
        "eq",
        `${Cypress.config().baseUrl}updatepassword?mode=resetPassword&oobCode=${
          oobCode.oobCode
        }`
      );

      cy.get('[data-cy="update-password-button"]').should("be.disabled");

      // Set up intercepts
      cy.intercept(
        "POST",
        "http://localhost:9099/www.googleapis.com/identitytoolkit/v3/relyingparty/resetPassword?**"
      ).as("reset-password-request");

      // fill in new password & confirm new password
      cy.log("Resetting to old password");
      cy.get('[data-cy="new-password"]').type(accounts.approved.password);
      cy.get('[data-cy="confirm-new-password"]').type(
        accounts.approved.password
      );

      cy.get('[data-cy="update-password-button"]').click();

      // cy.wait("@reset-password-request");
      // submit
      // go to login & test logging in
      // old password
      // new password
      // assert navigated to home
    });
  });
});
