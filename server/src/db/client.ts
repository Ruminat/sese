import { type Config, createClient } from "@libsql/client";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { drizzle } from "drizzle-orm/libsql";
import { getEnvironmentVariables } from "../common/environment.js";

const { useLocalDb, localDbPath, turso } = getEnvironmentVariables();

function getLocalDbConfig(): Config {
  const absolutePath = path.isAbsolute(localDbPath)
    ? localDbPath
    : path.join(process.cwd(), localDbPath);
  const directory = path.dirname(absolutePath);

  if (!existsSync(directory)) {
    mkdirSync(directory, { recursive: true });
  }

  return {
    url: pathToFileURL(absolutePath).toString(),
  };
}

const dbConfig: Config = useLocalDb
  ? getLocalDbConfig()
  : {
      url: turso.url,
      authToken: turso.authToken || undefined,
    };

export const libsqlClient = createClient(dbConfig);
export const db = drizzle(libsqlClient);
