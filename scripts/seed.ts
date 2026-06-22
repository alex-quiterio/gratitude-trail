import { execFileSync } from "child_process";

const url = process.env.POSTGRES_URL;
if (!url) throw new Error("POSTGRES_URL is not set");

console.log("Seeding database...");
execFileSync("psql", [url, "-f", "db/seed.sql"], { stdio: "inherit" });
