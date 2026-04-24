const fs = require("fs");

const input = fs.readFileSync(
  "pinterest-engine/output/master-pins.csv",
  "utf-8"
);

const lines = input.split("\n");
const header = lines[0];
const rows = lines.slice(1);

const batch1 = [header, ...rows.slice(0, 500)].join("\n");
const batch2 = [header, ...rows.slice(500)].join("\n");

fs.writeFileSync("batch-1.csv", batch1);
fs.writeFileSync("batch-2.csv", batch2);

console.log("Done: batch-1.csv + batch-2.csv");