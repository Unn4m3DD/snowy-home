import { getTurso } from "@/db/turso";
import { z } from "zod";

export const dynamic = "force-dynamic";
const json = (body: unknown, status = 200) => Response.json(body, {
  status, headers: { "Cache-Control": "no-store" },
});

// One shared tracker, independent of the listing dataset and daily imports.
export async function GET() {
  try {
    const result = await getTurso().execute("SELECT * FROM apartment_tracking");
    return json({ tracking: Object.fromEntries(result.rows.map(r => [String(r.listing_id), {
      approved: !!r.approved, contacted: !!r.contacted, visitAt: String(r.visit_at), notes: String(r.notes), removed: !!r.removed,
    }])) });
  } catch {
    return json({ error: "Could not load the shared tracker. Database setup or connection needs attention." }, 503);
  }
}
export async function PATCH(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return json({ error: "Invalid origin" }, 403);
  const schema = z.object({
    id: z.string().regex(/^[a-zA-Z0-9-]{1,100}$/),
    patch: z.object({
      approved: z.boolean().optional(), contacted: z.boolean().optional(), removed: z.boolean().optional(),
      notes: z.string().max(20000).optional(),
      visitAt: z.string().refine(v => v === "" || (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)))).optional(),
    }).strict().refine(v => Object.keys(v).length > 0),
  }).strict();
  let body: unknown;
  try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return json({ error: "Invalid tracking fields or visit date; notes limit is 20,000 characters" }, 400);
  const { id, patch } = parsed.data;
  const columns = { approved: "approved", contacted: "contacted", visitAt: "visit_at", notes: "notes", removed: "removed" };
  const keys = Object.keys(patch) as (keyof typeof patch)[];
  try {
    const names = keys.map(k => columns[k]);
    // Patch only submitted fields so another device's unrelated edits survive.
    await getTurso().execute({
      sql: `INSERT INTO apartment_tracking (listing_id, ${names.join(", ")}, updated_at) VALUES (?, ${keys.map(() => "?").join(", ")}, ?) ON CONFLICT(listing_id) DO UPDATE SET ${names.map(n => `${n}=excluded.${n}`).join(", ")}, updated_at=excluded.updated_at`,
      args: [id, ...keys.map(k => typeof patch[k] === "boolean" ? Number(patch[k]) : patch[k]!), new Date().toISOString()],
    });
    return json({ ok: true });
  } catch {
    return json({ error: "Could not save. Your change has not been stored." }, 503);
  }
}
