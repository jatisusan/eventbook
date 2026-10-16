"use client";

import api from "@/lib/axios";
import { useEffect, useState } from "react";
import EventCard, { Event } from "./EventCard";

const EventsList = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await api.get("/events");
        setEvents(response.data.data);
      } catch {
        setError("Unable to load events. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadEvents();
  }, []);

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
          <p className="mt-8 text-gray-500">No upcoming events are available.</p>
        )}

        {!isLoading && !error && events.length > 0 && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default EventsList;