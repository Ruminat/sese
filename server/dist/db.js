import { createClient } from "@libsql/client";
function requireEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}
export function createDbClient() {
    const url = requireEnv("TURSO_DATABASE_URL");
    const authToken = process.env.TURSO_AUTH_TOKEN;
    return createClient({
        url,
        authToken,
    });
}
