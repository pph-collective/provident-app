import fb from "@/firebase";

const TARGET_FILTERS = {
  all: () => true,
  intervention: (org) => org.intervention_arm,
  control: (org) => !org.intervention_arm,
};

const TARGET_GROUPS = Object.keys(TARGET_FILTERS);

/**
 * Returns a set of organization names filtered by the target
 *
 * @param {Object} target
 * @param {Object[]} organizations - array of all of the organizations
 * @returns {Set<String>}
 */
const getAssignedOrgs = (target, organizations) => {
  const targetGroupOrgs = organizations
    .filter((org) => target.groups.some((group) => TARGET_FILTERS[group](org)))
    .map((o) => o.name);

  return new Set([...target.organizations, ...targetGroupOrgs]);
};

/**
 * Returns a set of user emails filtered by the target
 *
 * @param {Object} target
 * @param {Object[]} organizations - array of all the organizations
 * @param {Object[]} users - array of all the users
 * @returns {Set<String>}
 */
const getAssignedUsers = (target, organizations, users) => {
  const assignedOrgs = getAssignedOrgs(target, organizations);

  return new Set([
    ...target.users,
    ...users
      .filter(
        (u) => u.status === "approved" && assignedOrgs.has(u.organization)
      )
      .map((u) => u.email),
  ]);
};

/**
 * Returns the form response data for a blank form response
 *
 * @param {Object} formAssignment
 * @returns {Object} formResponseData
 */
const getFormResponseData = (formAssignment) => {
  const { _id, form_id, form_type, release_date, expire_date } = formAssignment;

  return {
    form_id,
    type: form_type,
    form_assignment_id: _id,
    release_date,
    expire_date,
    response: {},
    status: "Not Started",
    last_updated: Date.now(),
  };
};

/**
 * Gets the assignments and emails for a target.
 *
 * @param {String} formType
 * @param {String} target
 * @param {Object[]} organizations
 * @param {Object[]} users
 * @returns {Object} assigned and emails
 */
const getAssignments = (formType, target, organizations, users) => {
  const assigned =
    formType === "organization"
      ? getAssignedOrgs(target, organizations)
      : getAssignedUsers(target, organizations, users);

  const emails =
    formType === "user"
      ? [...assigned]
      : users
          .filter(
            (user) =>
              user.status === "approved" &&
              user.role === "champion" &&
              assigned.has(user.organization)
          )
          .map((user) => user.email);

  return { assigned, emails };
};

/**
 * Adds form responses to the db for the target audience in the form assignment.
 *
 * To minimize calls to firebase, we pass in the full list of organizations and users.
 * Returns the emails of the targeted users.
 * @param {Object} formAssignment
 * @param {Object[]} organizations
 * @param {Object[]} users
 * @returns {String[]}
 */
const addFormResponses = async (formAssignment, organizations, users) => {
  const { form_type, target } = formAssignment;
  const formResponseData = getFormResponseData(formAssignment);

  const { assigned, emails } = getAssignments(
    form_type,
    target,
    organizations,
    users
  );

  await fb.batchAddFormResponses(form_type, [formResponseData], assigned);

  return emails;
};

/**
 * Adds form responses to the db for the user based on the existing form assignments
 *
 * @param {Object} user - needs the email and organization fields
 * @param {Object[]} formAssignments
 * @param {Object[]} organizations
 * @param {String} today - in ISO format. For example - "2021-01-01".
 * @returns {Promise<void>}
 */
const addFormResponsesForUser = async (
  user,
  formAssignments,
  organizations,
  today
) => {
  const activeUserFormAssignments = formAssignments.filter(
    (f) => f.form_type === "user" && today <= f.expire_date
  );

  let formResponses = [];
  for (const formAssignment of activeUserFormAssignments) {
    const { target } = formAssignment;
    const assignedOrgs = getAssignedOrgs(target, organizations);

    if (assignedOrgs.has(user.organization)) {
      formResponses.push(getFormResponseData(formAssignment));
    }
  }

  return await fb.batchAddFormResponses(
    "user",
    formResponses,
    new Set([user.email])
  );
};

export default {
  addFormResponses,
  addFormResponsesForUser,
  getAssignments,
  TARGET_GROUPS,
};
