import GEO from "@/assets/geojson/ri.json";

const MUNICIPALITIES = [...new Set(GEO.map((g) => g.properties.name))].sort();

const sortByProperty = (property) => (a, b) => {
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

const today = () => {
  return new Date().toISOString().split("T")[0];
};

const uniqueId = () => {
  const dateString = Date.now().toString(36);
  const randomness = Math.random().toString(36).substr(2);
  return dateString + randomness;
};

export default { MUNICIPALITIES, sortByProperty, today, uniqueId };
