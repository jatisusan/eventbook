"use client";

import api from "@/lib/axios";
import axios from "axios";
import { Event } from "@/components/EventCard";
import Link from "next/link";
import { useEffect, useState } from "react";

const EventDetails = ({ id }: { id: string }) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const response = await api.get<{ data: Event }>(`/events/${id}`);
        setEvent(response.data.data);
      } catch (requestError) {
        if (
          axios.isAxiosError(requestError) &&
          requestError.response?.status === 404
        ) {
          setError("Event not found.");
        } else {
          setError("Unable to load this event. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    void loadEvent();
  }, [id]);

  return (
    <section className="mx-auto max-w-4xl">
      <Link
        href="/#events"
        className="text-sm font-semibold text-[#276749] hover:underline"
      >
        Back to events
      </Link>

      {isLoading && (
        <p className="mt-8 text-gray-500" role="status">
          Loading event...
        </p>
      )}

      {!isLoading && error && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8">
          <p className="text-red-600" role="alert">
            {error}
          </p>
        </div>
      )}

      {!isLoading && !error && event && (
        <article className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex h-56 items-center justify-center bg-[#F0F5F0] sm:h-72">
            <span className="text-7xl font-bold text-[#276749]">
              {event.title.charAt(0)}
            </span>
          </div>
          <div className="p-6 sm:p-10">
            <p className="text-sm font-semibold text-[#276749]">
              {new Date(event.startsAt).toLocaleDateString()} ·{" "}
              {new Date(event.startsAt).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
              {event.title}
            </h1>
            <p className="mt-6 leading-7 text-gray-600">{event.description}</p>
            <div className="mt-8 grid gap-4 border-t border-gray-100 pt-6 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="mt-1 font-semibold">{event.venue}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Availability</p>
                <p className="mt-1 font-semibold">
                  {event.seatsLeft} of {event.totalSeats} seats left
                </p>
              </div>
            </div>
          </div>
        </article>
      )}
    </section>
  );
};

export default EventDetails;
