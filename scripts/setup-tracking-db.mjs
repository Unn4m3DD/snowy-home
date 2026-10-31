import { createClient } from '@libsql/client/web';
import { readFileSync } from 'node:fs';
// Run: node --env-file=.env.local scripts/setup-tracking-db.mjs
const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url || !authToken) throw new Error('Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in .env.local');
const db = createClient({ url, authToken });
await db.execute(readFileSync(new URL('../db/tracking.sql', import.meta.url), 'utf8'));
await db.execute('SELECT listing_id FROM apartment_tracking LIMIT 1');
console.log('Shared tracker schema ready; connection verified.');
db.close();
