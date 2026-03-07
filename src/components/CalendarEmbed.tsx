import type { EventClickArg } from "@fullcalendar/core/index.js";
import dayGridPlugin from "@fullcalendar/daygrid";
import iCalendarPlugin from "@fullcalendar/icalendar";
import listPlugin from "@fullcalendar/list";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { type ReactNode, useEffect, useMemo, useState } from "react";

const CALENDAR_PLUGINS = [
  dayGridPlugin,
  timeGridPlugin,
  listPlugin,
  iCalendarPlugin,
];

const HEADER_TOOLBAR = {
  left: "prev,next today",
  center: "title",
  right: "dayGridMonth,timeGridWeek,listMonth",
};

const URL_REGEX = /(https?:\/\/[^\s<>")]+|www\.[^\s<>")]+)/gi;

interface CalendarEmbedProps {
  icalUrl: string;
}

interface SelectedEventDetails {
  title: string;
  dateTime: string | null;
  location: string | null;
  description: string | null;
  url: string | null;
}

function normalizeText(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const normalized = value
    .replace(/\\n/g, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'")
    .trim();

  return normalized.length > 0 ? normalized : null;
}

function formatDateTimeRange(
  start: Date | null,
  end: Date | null,
  allDay: boolean,
): string | null {
  if (!start) return null;

  const locale = typeof navigator !== "undefined" ? navigator.language : "en-US";

  if (allDay) {
    const dayFormatter = new Intl.DateTimeFormat(locale, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    if (!end) return `${dayFormatter.format(start)} (All day)`;

    const inclusiveEnd = new Date(end);
    inclusiveEnd.setDate(inclusiveEnd.getDate() - 1);

    if (inclusiveEnd < start) return `${dayFormatter.format(start)} (All day)`;

    const sameDay = start.getFullYear() === inclusiveEnd.getFullYear()
      && start.getMonth() === inclusiveEnd.getMonth()
      && start.getDate() === inclusiveEnd.getDate();

    if (sameDay) return `${dayFormatter.format(start)} (All day)`;

    return `${dayFormatter.format(start)} – ${dayFormatter.format(inclusiveEnd)} (All day)`;
  }

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const timeFormatter = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
  });

  if (!end) {
    return `${dateFormatter.format(start)} • ${timeFormatter.format(start)}`;
  }

  const sameDay = start.getFullYear() === end.getFullYear()
    && start.getMonth() === end.getMonth()
    && start.getDate() === end.getDate();

  if (sameDay) {
    return `${dateFormatter.format(start)} • ${timeFormatter.format(start)} – ${timeFormatter.format(end)}`;
  }

  return `${dateFormatter.format(start)} ${timeFormatter.format(start)} – ${dateFormatter.format(end)} ${
    timeFormatter.format(end)
  }`;
}

function renderTextWithLinks(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let matchIndex = 0;

  for (const match of text.matchAll(URL_REGEX)) {
    const rawUrl = match[0];
    const start = match.index ?? 0;

    if (start > cursor) {
      nodes.push(text.slice(cursor, start));
    }

    const href = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
    nodes.push(
      <a key={`url-${matchIndex}`} href={href} target="_blank" rel="noopener noreferrer">
        {rawUrl}
      </a>,
    );

    cursor = start + rawUrl.length;
    matchIndex += 1;
  }

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }

  return nodes;
}

export default function CalendarEmbed({ icalUrl }: CalendarEmbedProps) {
  const [selectedEvent, setSelectedEvent] = useState<SelectedEventDetails | null>(null);

  const calendarEvents = useMemo(() => ({ url: icalUrl, format: "ics" as const }), [icalUrl]);

  useEffect(() => {
    if (!selectedEvent) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedEvent(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedEvent]);

  const descriptionParagraphs = useMemo(() => {
    if (!selectedEvent?.description) return [];
    return selectedEvent.description
      .split(/\n{2,}/)
      .map((part) => part.trim())
      .filter(Boolean);
  }, [selectedEvent?.description]);

  const handleEventClick = (clickInfo: EventClickArg) => {
    clickInfo.jsEvent.preventDefault();

    const { event } = clickInfo;
    const details: SelectedEventDetails = {
      title: event.title || "Untitled event",
      dateTime: formatDateTimeRange(event.start, event.end, event.allDay),
      location: normalizeText(event.extendedProps.location),
      description: normalizeText(event.extendedProps.description),
      url: normalizeText(event.url || event.extendedProps.url),
    };

    setSelectedEvent(details);
  };

  return (
    <div className="calendar-embed">
      <FullCalendar
        plugins={CALENDAR_PLUGINS}
        initialView="listMonth"
        headerToolbar={HEADER_TOOLBAR}
        events={calendarEvents}
        eventClick={handleEventClick}
        height="auto"
      />

      {selectedEvent && (
        <div
          className="calendar-modal-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedEvent(null);
            }
          }}
        >
          <div
            className="calendar-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="calendar-event-modal-title"
          >
            <button
              type="button"
              className="calendar-modal-close"
              aria-label="Close event details"
              onClick={() => setSelectedEvent(null)}
            >
              ×
            </button>

            <h3 id="calendar-event-modal-title" className="calendar-modal-title">
              {selectedEvent.title}
            </h3>

            {selectedEvent.dateTime && (
              <p className="calendar-modal-meta">
                <strong>When:</strong> {selectedEvent.dateTime}
              </p>
            )}

            {selectedEvent.location && (
              <p className="calendar-modal-meta">
                <strong>Where:</strong> {renderTextWithLinks(selectedEvent.location)}
              </p>
            )}

            {descriptionParagraphs.length > 0 && (
              <div className="calendar-modal-description">
                {descriptionParagraphs.map((paragraph, index) => (
                  <p key={`${paragraph}-${index}`}>{renderTextWithLinks(paragraph)}</p>
                ))}
              </div>
            )}

            {selectedEvent.url && (
              <p className="calendar-modal-actions">
                <a
                  href={selectedEvent.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--primary"
                >
                  Open Event Link
                </a>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
