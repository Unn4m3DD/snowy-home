import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@libsql/client";

// This local search input contains only discarded IDs, never other tracker fields.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, ".daily-search/discarded.json");
const { TURSO_DATABASE_URL: url, TURSO_AUTH_TOKEN: authToken } = process.env;
if (!url || !authToken) throw new Error("Turso credentials are required to check discarded apartments.");
const client = createClient({ url, authToken });
try {
  const result = await client.execute("SELECT listing_id FROM apartment_tracking WHERE removed = 1");
  const ids = result.rows.map(row => String(row.listing_id)).sort();
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, `${JSON.stringify({ checkedAt: new Date().toISOString(), ids }, null, 2)}\n`);
  console.log(`Loaded ${ids.length} discarded apartment IDs for local search exclusions.`);
} catch {
  await fs.rm(output, { force: true });
  throw new Error("Could not refresh discarded IDs. Stop the search instead of using stale exclusions.");
} finally {
  client.close();
}
