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

export default {
  getAssignedUsers,
  getAssignedOrgs,
};
