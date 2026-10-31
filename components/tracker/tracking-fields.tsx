"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ApartmentTracking } from "@/lib/tracking";

export function TrackingFields({ value, disabled, onChange }: {
  value: ApartmentTracking;
  disabled: boolean;
  onChange: (patch: Partial<ApartmentTracking>) => Promise<boolean>;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const [visitDraft, setVisitDraft] = useState<string | null>(null);
  const notes = draft ?? value.notes;
  const visitAt = visitDraft ?? value.visitAt;
  return <section className="tracking-fields" aria-label="Apartment tracking">
    <h3>Tracking</h3>
    <label className="tracking-contact"><input type="checkbox" checked={value.contacted} disabled={disabled} onChange={e => void onChange({ contacted: e.target.checked })} /> Already contacted</label>
    <label>Visit · Portugal time<Input type="datetime-local" value={visitAt} disabled={disabled} onInput={e => setVisitDraft(e.currentTarget.value)} onChange={e => setVisitDraft(e.target.value)} /></label>
    <label>Notes<textarea rows={4} maxLength={20000} value={notes} disabled={disabled} onChange={e => setDraft(e.target.value)} /></label>
    <div className="tracking-actions">
      <Button variant="outline" disabled={disabled || (notes === value.notes && visitAt === value.visitAt)} onClick={async () => {
        const patch: Partial<ApartmentTracking> = {};
        if (notes !== value.notes) patch.notes = notes;
        if (visitAt !== value.visitAt) patch.visitAt = visitAt;
        if (await onChange(patch)) { setDraft(null); setVisitDraft(null); }
      }}>Save visit & notes</Button>
      <Button variant="outline" disabled={disabled} onClick={() => void onChange({ removed: !value.removed })}>{value.removed ? "Restore apartment" : "Remove apartment"}</Button>
    </div>
  </section>;
}
