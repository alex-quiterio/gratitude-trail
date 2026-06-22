import { execFileSync } from "child_process";
import { readdirSync } from "fs";

const url = process.env.POSTGRES_URL;
if (!url) throw new Error("POSTGRES_URL is not set");

const files = readdirSync("db/migrations")
  .filter((f) => f.endsWith(".sql"))
  .sort();

for (const file of files) {
  console.log("Applying", file);
  execFileSync("psql", [url, "-f", `db/migrations/${file}`], {
    stdio: "inherit",
  });
}
