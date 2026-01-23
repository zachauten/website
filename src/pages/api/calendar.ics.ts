import type { APIRoute } from "astro";

const CACHE_SECONDS = 300;

export const GET: APIRoute = async () => {
  const feedUrl = import.meta.env.PUBLIC_ICAL_FEED_URL;

  if (!feedUrl) {
    return new Response("Calendar feed not configured", { status: 500 });
  }

  try {
    const response = await fetch(feedUrl, {
      headers: {
        Accept: "text/calendar",
      },
    });

    if (!response.ok) {
      return new Response("Failed to fetch calendar feed", { status: 502 });
    }

    const icalBody = await response.text();

    return new Response(icalBody, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Cache-Control": `public, max-age=${CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}`,
      },
    });
  } catch {
    return new Response("Failed to fetch calendar feed", { status: 502 });
  }
};
