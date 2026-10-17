"use client";

import api from "@/lib/axios";
import { useEffect, useState } from "react";
import EventCard, { Event } from "./EventCard";

const EventsList = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await api.get("/events", {
          params: { page, limit: 3, search: debouncedSearch },
        });
        setEvents(response.data.data);
        setTotalPages(response.data.totalPages);
      } catch {
        setError("Unable to load events. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, [page, debouncedSearch]);

  return (
    <section id="events" className="bg-white px-5 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-[#276749]">
            Find your experience
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Explore events
          </h2>
          <p className="mt-3 text-gray-600">
            Find something worth looking forward to.
          </p>
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
            }}
            placeholder="Search events by title..."
            className="mt-6 w-full max-w-md rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:ring-2 focus:ring-[#276749]/20"
          />
        </div>

        {isLoading && (
          <p className="mt-8 text-gray-500" role="status">
            Loading events...
          </p>
        )}

        {!isLoading && error && (
          <p className="mt-8 text-red-600" role="alert">
            {error}
          </p>
        )}

        {!isLoading && !error && events.length === 0 && (
          <p className="mt-8 text-gray-500">
            No upcoming events are available.
          </p>
        )}

        {!isLoading && !error && events.length > 0 && (
          <>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold transition hover:border-[#276749] hover:text-[#276749] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold transition hover:border-[#276749] hover:text-[#276749] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default EventsList;
