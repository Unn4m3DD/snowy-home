"use client";
import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { enGB } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ApartmentTracking } from "@/lib/tracking";

export function TrackingFields({ value, disabled, needsReview, onChange }: {
  value: ApartmentTracking;
  disabled: boolean;
  needsReview: boolean;
  onChange: (patch: Partial<ApartmentTracking>) => Promise<boolean>;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const [visitDraft, setVisitDraft] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const notes = draft ?? value.notes;
  const visitAt = visitDraft ?? value.visitAt;
  const [visitDay, visitTime = "09:00"] = visitAt.split("T");
  const selectedDay = visitDay ? new Date(`${visitDay}T12:00:00`) : undefined;
  const [hour, minute] = visitTime.split(":");
  return <section className="tracking-fields" aria-label="Apartment tracking">
    <h3>Tracking</h3>
    <label className="tracking-contact"><input type="checkbox" checked={value.contacted} disabled={disabled} onChange={e => void onChange({ contacted: e.target.checked })} /> Already contacted</label>
    <div className="visit-picker" role="group" aria-labelledby="visit-label">
      <span id="visit-label">Visit · Portugal time</span>
      <div className="visit-picker-controls">
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" disabled={disabled} aria-label="Choose visit date" className="visit-date-trigger">
              <CalendarIcon size={16} />{selectedDay ? format(selectedDay, "dd MMM yyyy") : "Choose date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="visit-calendar-popover" onKeyDown={event => event.stopPropagation()}>
            <Calendar mode="single" selected={selectedDay} defaultMonth={selectedDay} locale={enGB} autoFocus
              onSelect={day => {
                if (day) setVisitDraft(`${format(day, "yyyy-MM-dd")}T${visitTime}`);
                setCalendarOpen(false);
              }} />
          </PopoverContent>
        </Popover>
        <Select value={hour} disabled={disabled || !visitDay} onValueChange={hour => setVisitDraft(`${visitDay}T${hour}:${minute}`)}>
          <SelectTrigger aria-label="Visit hour" className="visit-time-select"><SelectValue /></SelectTrigger>
          <SelectContent position="popper" onKeyDown={event => event.stopPropagation()}>
            {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")).map(hour => <SelectItem key={hour} value={hour}>{hour}</SelectItem>)}
          </SelectContent>
        </Select>
        <span aria-hidden="true">:</span>
        <Select value={minute} disabled={disabled || !visitDay} onValueChange={minute => setVisitDraft(`${visitDay}T${hour}:${minute}`)}>
          <SelectTrigger aria-label="Visit minute" className="visit-time-select"><SelectValue /></SelectTrigger>
          <SelectContent position="popper" onKeyDown={event => event.stopPropagation()}>
            {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")).map(minute => <SelectItem key={minute} value={minute}>{minute}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {visitDay && <button className="clear-visit" type="button" disabled={disabled} onClick={() => setVisitDraft("")}>Clear visit</button>}
    </div>
    <label>Notes<textarea rows={4} maxLength={20000} value={notes} disabled={disabled} onChange={e => setDraft(e.target.value)} /></label>
    <div className="tracking-actions">
      {needsReview && <Button disabled={disabled} onClick={() => void onChange({ approved: true })}>Approve apartment</Button>}
      {value.approved && <Button variant="outline" disabled={disabled} onClick={() => void onChange({ approved: false })}>Move to review</Button>}
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
