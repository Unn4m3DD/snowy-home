"use client";

import { format, isValid, parseISO } from "date-fns";
import type { ApartmentTracking } from "@/lib/tracking";

type CalendarListing = { id: string; title: string };

export function RentalCalendar<T extends CalendarListing>({
  listings, tracking, trackerReady, onOpen,
}: {
  listings: T[];
  tracking: Record<string, ApartmentTracking>;
  trackerReady: boolean;
  onOpen: (listing: T) => void;
}) {
  const visits = listings.flatMap(listing => {
    const visitAt = tracking[listing.id]?.visitAt ?? "";
    const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/.exec(visitAt);
    if (!match || !isValid(parseISO(visitAt))) return [];
    const [, day, time] = match;
    return [{ listing, day, time }];
  }).sort((a, b) => a.day.localeCompare(b.day) || a.time.localeCompare(b.time));

  const visitsByDay = new Map<string, typeof visits>();
  for (const visit of visits) {
    const dayVisits = visitsByDay.get(visit.day) ?? [];
    dayVisits.push(visit);
    visitsByDay.set(visit.day, dayVisits);
  }

  return (
    <section className="rental-calendar" aria-label="Visit calendar">
      {visitsByDay.size ? (
        Array.from(visitsByDay, ([day, dayVisits]) => (
          <section className="rental-calendar-agenda" key={day}>
            <h2><time dateTime={day}>{format(parseISO(day), "EEEE, d MMMM yyyy")}</time></h2>
            <ul className="rental-agenda-list">
              {dayVisits.map(visit => (
                <li key={visit.listing.id}>
                  <button type="button" onClick={() => onOpen(visit.listing)}>
                    <span>{visit.time} Portugal time</span>
                    <strong>{visit.listing.title}</strong>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))
      ) : (
        <p className="rental-calendar-agenda">
          {trackerReady ? "No scheduled visits." : "Visits appear when the shared tracker is connected."}
        </p>
      )}
    </section>
  );
}
