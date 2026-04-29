import { config } from "dotenv";
import { createClient } from "@libsql/client";

config({ path: ".env" });

const localPath = process.env.LOCAL_DB_PATH || "./data/migration-verify.db";
const useLocalDb =
  (process.env.USE_LOCAL_DB === "true" || process.env.USE_LOCAL_DB === "1") &&
  (process.env.MODE || "dev") === "dev";

const dbUrl = useLocalDb
  ? `file:${localPath}`
  : process.env.TURSO_DATABASE_URL || process.env.TURSO_CONNECTION_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!dbUrl) {
  console.error(
    "Missing database URL. Set USE_LOCAL_DB=true with LOCAL_DB_PATH, or set TURSO_DATABASE_URL.",
  );
  process.exit(1);
}

const client = createClient({
  url: dbUrl,
  authToken: useLocalDb ? undefined : authToken,
});

const expectedColumns = [
  "id",
  "title",
  "encrypted_content",
  "iv",
  "auth_tag",
  "created_at",
  "updated_at",
];

try {
  const tableRows = await client.execute("PRAGMA table_info(documents);");
  const existingColumns = tableRows.rows.map((row) => String(row.name));
  const missingColumns = expectedColumns.filter((column) => !existingColumns.includes(column));

  if (missingColumns.length > 0) {
    console.error(`Schema verification failed. Missing columns: ${missingColumns.join(", ")}`);
    process.exit(1);
  }

  const indexRows = await client.execute(
    "SELECT name FROM sqlite_master WHERE type = 'index' AND name = 'idx_documents_updated_at';",
  );

  if (indexRows.rows.length !== 1) {
    console.error("Schema verification failed. Missing index: idx_documents_updated_at");
    process.exit(1);
  }

  console.log(`Schema verification passed for ${dbUrl}`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Schema verification failed: ${message}`);
  process.exit(1);
} finally {
  await client.close();
}
