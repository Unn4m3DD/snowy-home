"use client";

import { format, isValid, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import type { ApartmentTracking } from "@/lib/tracking";

type CalendarListing = {
  id: string;
  title: string;
  address: string;
  town: string;
  routeUrl: string;
};

function VisitLocation({ listing }: { listing: CalendarListing }) {
  const address = listing.address.trim();
  const areaOnly = !address || address === listing.town || /\bnear\b|address withheld/i.test(address);
  const addressQuery = [
    address.replace(/\s*·\s*exact address withheld$/i, ""),
    address.toLowerCase().includes(listing.town.toLowerCase()) ? "" : listing.town,
    "Portugal",
  ].filter(Boolean).join(", ");
  let coordinates = "";
  if (areaOnly) {
    try {
      const origin = new URL(listing.routeUrl).searchParams.get("origin") ?? "";
      if (/^-?\d+(?:\.\d+)?,-?\d+(?:\.\d+)?$/.test(origin)) coordinates = origin;
    } catch {
      // A missing route leaves the address search available.
    }
  }
  const maps = new URLSearchParams({ api: "1", query: coordinates || addressQuery });
  const waze = new URLSearchParams(coordinates ? { ll: coordinates } : { q: addressQuery });

  return (
    <div className="rental-visit-location">
      <span>{address || listing.town}{areaOnly && " (approximate area)"}</span>
      <div className="rental-visit-links">
        <Button asChild variant="outline" size="sm">
          <a href={`https://www.google.com/maps/search/?${maps}`} target="_blank" rel="noreferrer"
            aria-label={`Open location in Google Maps for ${listing.title}`}>Google Maps</a>
        </Button>
        <Button asChild variant="outline" size="sm">
          <a href={`https://www.waze.com/ul?${waze}`} target="_blank" rel="noreferrer"
            aria-label={`Open location in Waze for ${listing.title}`}>Waze</a>
        </Button>
      </div>
    </div>
  );
}

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
                  <VisitLocation listing={visit.listing} />
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
