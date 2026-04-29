import { config } from "dotenv";
import path from "node:path";
import { z } from "zod";
config({ path: ".env" });
const envSchema = z
    .object({
    MODE: z.enum(["dev", "prod"]).optional(),
    PORT: z.coerce.number().optional(),
    SERVER_API_KEY: z.string().optional(),
    SERVER_ENCRYPTION_KEY: z.string().optional(),
    USE_LOCAL_DB: z
        .string()
        .optional()
        .transform((value) => value === "true" || value === "1"),
    LOCAL_DB_PATH: z.string().optional(),
    TURSO_DATABASE_URL: z.string().optional(),
    TURSO_CONNECTION_URL: z.string().optional(),
    TURSO_AUTH_TOKEN: z.string().optional(),
})
    .superRefine((data, ctx) => {
    const isDev = (data.MODE ?? "dev") === "dev";
    const useLocalDb = (data.USE_LOCAL_DB ?? false) && isDev;
    const tursoUrl = data.TURSO_DATABASE_URL ?? data.TURSO_CONNECTION_URL;
    const serverEncryptionKey = data.SERVER_ENCRYPTION_KEY?.trim();
    if (!useLocalDb && !tursoUrl) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Set TURSO_DATABASE_URL (or TURSO_CONNECTION_URL), or enable USE_LOCAL_DB=true in dev mode.",
        });
    }
    if (!serverEncryptionKey) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Set SERVER_ENCRYPTION_KEY (base64-encoded 32-byte key).",
        });
    }
});
const values = envSchema.parse(process.env);
export function getEnvironmentVariables() {
    const isDev = (values.MODE ?? "dev") === "dev";
    const useLocalDb = (values.USE_LOCAL_DB ?? false) && isDev;
    const localDbPath = values.LOCAL_DB_PATH ?? path.join(process.cwd(), "data", "local.db");
    return {
        mode: values.MODE ?? "dev",
        port: values.PORT ?? 8787,
        serverApiKey: values.SERVER_API_KEY?.trim() || "",
        serverEncryptionKey: values.SERVER_ENCRYPTION_KEY?.trim() || "",
        useLocalDb,
        localDbPath,
        turso: {
            url: values.TURSO_DATABASE_URL ?? values.TURSO_CONNECTION_URL ?? "",
            authToken: values.TURSO_AUTH_TOKEN ?? "",
        },
    };
}
