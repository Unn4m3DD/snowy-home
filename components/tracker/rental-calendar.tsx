"use client";

import { useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import { enGB } from "date-fns/locale";
import { labelDayButton } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import type { ApartmentTracking } from "@/lib/tracking";

type CalendarListing = { id: string; title: string };

const portugalDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Lisbon",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function RentalCalendar<T extends CalendarListing>({
  listings, tracking, trackerReady, onOpen,
}: {
  listings: T[];
  tracking: Record<string, ApartmentTracking>;
  trackerReady: boolean;
  onOpen: (listing: T) => void;
}) {
  const parts = portugalDate.formatToParts();
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(value => value.type === type)?.value;
  const today = parseISO(`${part("year")}-${part("month")}-${part("day")}`);
  const [month, setMonth] = useState(today);
  const [selectedDay, setSelectedDay] = useState<Date>();

  const visits = listings.flatMap(listing => {
    const visitAt = tracking[listing.id]?.visitAt ?? "";
    const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/.exec(visitAt);
    if (!match || !isValid(parseISO(visitAt))) return [];
    const [, day, time] = match;
    return [{ listing, day, time }];
  });
  const visitDays = new Set(visits.map(visit => visit.day));
  const monthKey = format(month, "yyyy-MM");
  const selectedKey = selectedDay && format(selectedDay, "yyyy-MM-dd");
  const day = selectedKey && visitDays.has(selectedKey) ? selectedDay : undefined;
  const agenda = visits
    .filter(visit => day ? visit.day === selectedKey : visit.day.startsWith(monthKey))
    .sort((a, b) => a.day.localeCompare(b.day) || a.time.localeCompare(b.time));

  return (
    <section className="rental-calendar" aria-label="Visit calendar">
      <div className="rental-calendar-grid">
        <Calendar
          className="rental-month"
          mode="single"
          locale={enGB}
          month={month}
          today={today}
          selected={day}
          showOutsideDays={false}
          hidden={date => !visitDays.has(format(date, "yyyy-MM-dd"))}
          onMonthChange={nextMonth => {
            setMonth(nextMonth);
            setSelectedDay(undefined);
          }}
          onSelect={setSelectedDay}
          labels={{
            labelDayButton: (date, modifiers, options) =>
              `${labelDayButton(date, modifiers, options)}, scheduled visits`,
          }}
        />
        <Button variant="ghost" size="sm" onClick={() => {
          setMonth(today);
          setSelectedDay(undefined);
        }}>Today</Button>
      </div>
      <div className="rental-calendar-agenda">
        <div className="rental-agenda-heading">
          <h2 aria-live="polite">{format(day ?? month, day ? "EEE, d MMM yyyy" : "MMMM yyyy")}</h2>
          {day && <Button variant="ghost" size="sm" onClick={() => setSelectedDay(undefined)}>Whole month</Button>}
        </div>
        {agenda.length ? (
          <ul className="rental-agenda-list">
            {agenda.map(visit => (
              <li key={visit.listing.id}>
                <button type="button" onClick={() => onOpen(visit.listing)}>
                  <span>{format(parseISO(visit.day), "d MMM")} · {visit.time} Portugal time</span>
                  <strong>{visit.listing.title}</strong>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>{trackerReady ? "No scheduled visits this month." : "Visits appear when the shared tracker is connected."}</p>
        )}
      </div>
    </section>
  );
}
