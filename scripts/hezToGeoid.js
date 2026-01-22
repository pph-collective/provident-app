const fs = require("fs");

const csv = fs.readFileSync("./data/PROVIDENT_HEZ_GEOIDs.csv", "utf8");
const lines = csv.trim().split("\n").slice(1); // skip header

const hezGroups = {};

lines.forEach((line) => {
  const [geoid, hez] = line.split(",");
  if (hez && hez.trim()) {
    const hezName = hez.trim();
    if (!hezGroups[hezName]) {
      hezGroups[hezName] = [];
    }
    hezGroups[hezName].push(geoid.substring(5));
  }
});

const result = Object.keys(hezGroups)
  .sort()
  .map((name) => ({
    name: name,
    municipalities: [],
    geoids: hezGroups[name],
  }));

fs.writeFileSync("PROVIDENT_HEZ_GEOIDs.json", JSON.stringify(result, null, 2));
console.log(
  "Created PROVIDENT_HEZ_GEOIDs.json with",
  result.length,
  "HEZ groups",
);
