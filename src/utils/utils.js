import GEO from "../assets/geojson/ri.json";

export const MUNICIPALITIES = [
  ...new Set(GEO.map((g) => g.properties.name)),
].sort();

export const GEOID_QUESTION_MODEL = "bg_id";
export const MUNI_QUESTION_MODEL = "municipality";

export const sortByProperty = (property) => (a, b) => {
  let valA = a[property];
  let valB = b[property];

  // if strings, ignore upper and lowercase
  if (typeof valA === "string" && typeof valB === "string") {
    valA = valA.toUpperCase();
    valB = valB.toUpperCase();
  }

  if (valA < valB) {
    return -1;
  }
  if (valA > valB) {
    return 1;
  }

  // values must be equal
  return 0;
};

export const today = () => {
  return new Date().toISOString().split("T")[0];
};

export const uniqueId = () => {
  const dateString = Date.now().toString(36);
  const randomness = Math.random().toString(36).substr(2);
  return dateString + randomness;
};

export const tertileColorMap = new Map([
  [1, "hsl(230deg 41% 28%)"],
  [2, "hsl(0deg 0% 70%)"],
  [3, "orange"],
]);

export const uniqueArray = (array) => {
  const set = new Set(array);
  return Array.from(set).sort();
};

export const poriRed = "#990000";

export const cloneDeep = (value) => JSON.parse(JSON.stringify(value));

export const evalSchema = (s, yup) => {
  s.forEach((q) => {
    for (const key in q) {
      if (["condition", "validations"].includes(key)) {
        q[key] = eval(q[key]);
      } else if (key === "component" && !q[key].startsWith("Form")) {
        q[key] = "Form" + q[key];
      }
    }
  });

  return yup;
};

export default {
  GEOID_QUESTION_MODEL,
  MUNICIPALITIES,
  MUNI_QUESTION_MODEL,
  poriRed,
  tertileColorMap,
  cloneDeep,
  evalSchema,
  sortByProperty,
  today,
  uniqueArray,
  uniqueId,
};
