import fb from "@/firebase";

/**
 * Returns a set of organization names filtered by the target
 *
 * @param {Object} target
 * @param {Object[]} organizations - array of all of the organizations
 * @returns {Set<String>}
 */
const getAssignedOrgs = (target, organizations) => {
  const assignedGroups = [...target.groups];

  const allOrgs = organizations.map((org) => org.name);
  const interventionOrgs = organizations
    .filter((org) => org.intervention_arm)
    .map((org) => org.name);
  const controlOrgs = organizations
    .filter((org) => !org.intervention_arm)
    .map((org) => org.name);

  return new Set([
    ...target.organizations,
    ...(assignedGroups.includes("all") ? allOrgs : []),
    ...(assignedGroups.includes("intervention") ? interventionOrgs : []),
    ...(assignedGroups.includes("control") ? controlOrgs : []),
  ]);
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
      .filter((u) => assignedOrgs.has(u.organization))
      .map((u) => u.email),
  ]);
};

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

const addFormResponses = async (formAssignment, organizations, users) => {
  const { form_type, target } = formAssignment;
  const formResponseData = getFormResponseData(formAssignment);

  const assigned =
    form_type === "organization"
      ? getAssignedOrgs(target, organizations)
      : getAssignedUsers(target, organizations, users);

  return await fb.batchAddFormResponses(
    form_type,
    [formResponseData],
    assigned
  );
};

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
  getAssignedOrgs,
  getAssignedUsers,
  getFormResponseData,
};
