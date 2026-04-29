import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createDbClient } from "./db.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(__dirname, "..", "schema.sql");
async function initDb() {
    const schemaSql = await readFile(schemaPath, "utf8");
    const statements = schemaSql
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean);
    const db = createDbClient();
    for (const statement of statements) {
        await db.execute(statement);
    }
    console.log("Database schema initialized successfully.");
}
initDb().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to initialize database schema: ${message}`);
    process.exit(1);
});
