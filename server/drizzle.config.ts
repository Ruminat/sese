import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { getEnvironmentVariables } from "./src/common/environment";

config({ path: ".env" });

const env = getEnvironmentVariables();

export default defineConfig({
  schema: "./src/modules/*/model.ts",
  out: "./migrations",
  dialect: "turso",
  dbCredentials: env.useLocalDb
    ? {
        url: `file:${env.localDbPath}`,
      }
    : {
        url: env.turso.url,
        authToken: env.turso.authToken,
      },
});
