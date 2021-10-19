import GEO from "@/assets/geojson/ri.json";

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

export default {
  GEOID_QUESTION_MODEL,
  MUNICIPALITIES,
  MUNI_QUESTION_MODEL,
  sortByProperty,
  tertileColorMap,
  today,
  uniqueId,
};
