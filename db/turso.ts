import { createClient } from "@libsql/client/web";
import { env } from "cloudflare:workers";

// Read runtime secrets only on the server, never through Vite's client env.
export function getTurso() {
  const runtime = env as unknown as Record<string, string | undefined>;
  const url = runtime.TURSO_DATABASE_URL || process.env.TURSO_DATABASE_URL;
  const authToken = runtime.TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) throw new Error("Tracking database is not configured");
  return createClient({ url, authToken });
}
