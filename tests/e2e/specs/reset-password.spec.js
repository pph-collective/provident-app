import ACCOUNTS from "../../fixtures/accounts.json";

describe("Login Page: Requesting an email to reset password", () => {
  beforeEach(() => {
    cy.get("[data-cy='login-button']").click();
  });

  it("Submit empty form to reset password", () => {
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

  it("Submit an invalid email", () => {
    cy.get('[type="email"]').type("doesnotexist@doesnotexist.com");
    cy.get('[data-cy="reset-password"]').click();
    cy.get('[data-cy="error-message"]').should(
      "contain",
      "There is no user record corresponding to this identifier. The user may have been deleted."
    );
  });

  it("Submit valid reset email request", () => {
    // Intercept the password email reset request
    cy.intercept(
      "POST",
      "http://localhost:9099/www.googleapis.com/identitytoolkit/v3/relyingparty/getOobConfirmationCode?**",
      (req) => {
        // Assert the request
        expect(req.body.requestType).to.equal("PASSWORD_RESET");
        expect(req.body.email).to.equal(ACCOUNTS.approved.email);

        // Asset the response
        req.continue((res) => {
          expect(res.statusCode).to.equal(200);
        });
      }
    ).as("password-email-reset-request");

    // User types in email and clicks reset password
    cy.get('[type="email"]').type(ACCOUNTS.approved.email);
    cy.get('[data-cy="reset-password"]').click();

    // Getting pass this wait asserts that that a request of this type happened
    // User was sent an email
    cy.wait("@password-email-reset-request").then((req) => {
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

    cy.get("@oobCodes-request").then((res) => {
      cy.log(res);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("oobCodes");
      expect(res.body.oobCodes).to.not.be.empty;

      const oobCode = res.body.oobCodes[res.body.oobCodes.length - 1];
      expect(oobCode.email).to.equal(ACCOUNTS.approved.email);
      expect(oobCode.requestType).to.equal("PASSWORD_RESET");
      expect(oobCode.oobCode).to.exist;

      // Use the oobCode to then go reset password!
      // navigate to /auth?mode=resetPassword&oobCode=??????
      cy.visit(`/auth?mode=resetPassword&oobCode=${oobCode.oobCode}`);

      // assert redirect to /updatepassword
      cy.url().should(
        "eq",
        `${Cypress.config().baseUrl}updatepassword?mode=resetPassword&oobCode=${
          oobCode.oobCode
        }`
      );
    });
  });
});

describe("Reset Password Page", () => {
  beforeEach(() => {
    cy.get("[data-cy='login-button']").click();

    // Intercept the password email reset request
    cy.intercept(
      "POST",
      "http://localhost:9099/www.googleapis.com/identitytoolkit/v3/relyingparty/getOobConfirmationCode?**"
    ).as("password-email-reset-request");

    // User types in email and clicks reset password
    cy.get('[type="email"]').type(ACCOUNTS.approved.email);
    cy.get('[data-cy="reset-password"]').click();

    // Getting pass this wait asserts that that a request of this type happened
    // User was sent an email
    cy.wait("@password-email-reset-request");

    // Get the oobCode
    cy.request(
      "GET",
      "http://localhost:9099/emulator/v1/projects/provident-ri/oobCodes"
    ).as("oobCodes-request");

    cy.get("@oobCodes-request").then((res) => {
      const oobCode = res.body.oobCodes[res.body.oobCodes.length - 1];
      cy.visit(`/auth?mode=resetPassword&oobCode=${oobCode.oobCode}`);

      // assert redirect to /updatepassword
      cy.url().should(
        "eq",
        `${Cypress.config().baseUrl}updatepassword?mode=resetPassword&oobCode=${
          oobCode.oobCode
        }`
      );
    });
  });

  it("Log in with old password before reset", () => {
    cy.get("[data-cy='login-button']").click();
    cy.get('[type="email"]').type(ACCOUNTS.approved.email);
    cy.get('[type="password"]').type(`${ACCOUNTS.approved.password}{enter}`);

    // Assert redirected home
    cy.url().should("eq", Cypress.config().baseUrl);
    cy.get('[data-cy="logout-button"]').should("exist");
  });

  it("Reset to old password", () => {
    // Set up intercepts
    cy.intercept(
      "POST",
      "http://localhost:9099/www.googleapis.com/identitytoolkit/v3/relyingparty/resetPassword?**"
    ).as("reset-password-request");

    // fill in new password & confirm new password
    cy.get('[data-cy="new-password"]').type(ACCOUNTS.approved.password);
    cy.get('[data-cy="confirm-new-password"]').type(ACCOUNTS.approved.password);
    cy.get('[data-cy="update-password-button"]').click();
    cy.wait("@reset-password-request");

    // Assert we are on the login page and log in
    cy.url().should("contains", `${Cypress.config().baseUrl}login`);
    cy.get('[type="email"]').type(ACCOUNTS.admin.email);
    cy.get('[type="password"]').type(`${ACCOUNTS.admin.password}{enter}`);

    // Assert logged in
    cy.url().should("eq", Cypress.config().baseUrl);
    cy.get('[data-cy="logout-button"]').should("exist");
  });

  it("Reset to new password", () => {
    // Set up intercepts
    cy.intercept(
      "POST",
      "http://localhost:9099/www.googleapis.com/identitytoolkit/v3/relyingparty/resetPassword?**"
    ).as("reset-password-request");

    // fill in new password & confirm new password
    cy.get('[data-cy="new-password"]').type("new-password");
    cy.get('[data-cy="confirm-new-password"]').type("new-password");
    cy.get('[data-cy="update-password-button"]').click();
    cy.wait("@reset-password-request");

    // Assert we are on the login page
    cy.url().should("contain", `${Cypress.config().baseUrl}login`);
    cy.get('[type="email"]').type(ACCOUNTS.approved.email);
    cy.get('[type="password"]').type("new-password{enter}");

    // Assert redirected home
    cy.url().should("eq", Cypress.config().baseUrl);
    cy.get('[data-cy="logout-button"]').should("exist").click();

    // Log out and try to sign in with old password
    cy.get("[data-cy='login-button']").click();
    cy.get('[type="email"]').type(ACCOUNTS.approved.email);
    cy.get('[type="password"]').type(`${ACCOUNTS.approved.password}{enter}`);

    // Assert old password does not work
    cy.get('[data-cy="error-message"]').should(
      "contain",
      "The password is invalid or the user does not have a password."
    );
  });
});
