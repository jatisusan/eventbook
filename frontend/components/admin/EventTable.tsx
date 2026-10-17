"use client";

import type { Event } from "@/components/EventCard";
import api from "@/lib/axios";
import axios from "axios";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

const EventTable = ({ events }: { events: Event[] }) => {
  const [displayedEvents, setDisplayedEvents] = useState(events);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!eventToDelete) {
      return;
    }

    setDeletingEventId(eventToDelete.id);

    try {
      const response = await api.delete(`/events/${eventToDelete.id}`);
      setDisplayedEvents((currentEvents) =>
        currentEvents.filter((event) => event.id !== eventToDelete.id),
      );
      setEventToDelete(null);
      toast.success(response.data.message || "Event deleted successfully.");
    } catch (requestError) {
      const message = axios.isAxiosError(requestError)
        ? requestError.response?.data?.message
        : undefined;
      toast.error(message || "Unable to delete event. Please try again.");
    } finally {
      setDeletingEventId(null);
    }
  };

  return (
    <>
      <div className="mt-8 overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-160 text-left text-sm">
          <thead className="border-b border-gray-200 bg-[#F0F5F0] text-gray-600">
            <tr>
              <th className="px-5 py-4 font-semibold">Event</th>
              <th className="px-5 py-4 font-semibold">Date and time</th>
              <th className="px-5 py-4 font-semibold">Venue</th>
              <th className="px-5 py-4 font-semibold">Seats</th>
              <th className="px-5 py-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayedEvents.map((event) => (
              <tr key={event.id}>
                <td className="px-5 py-4 font-semibold">{event.title}</td>
                <td className="px-5 py-4 text-gray-600">
                  {new Date(event.startsAt).toLocaleDateString()} ·{" "}
                  {new Date(event.startsAt).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-5 py-4 text-gray-600">{event.venue}</td>
                <td className="px-5 py-4 text-gray-600">
                  {event.seatsLeft} of {event.totalSeats} left
                </td>
                <td className="space-x-4 px-5 py-4">
                  <Link
                    href={`/events/${event.id}`}
                    className="font-semibold text-[#276749] hover:underline"
                  >
                    View
                  </Link>
                  <Link
                    href={`/admin/events/${event.id}/edit`}
                    className="font-semibold text-gray-600 hover:text-[#276749] hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => setEventToDelete(event)}
                    disabled={deletingEventId !== null}
                    className="font-semibold text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {eventToDelete && (
        <div
          className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 px-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-event-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <h2 id="delete-event-title" className="text-xl font-bold">
              Delete event?
            </h2>
            <p className="mt-3 text-gray-600">
              Are you sure you want to delete &quot;{eventToDelete.title}&quot;?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEventToDelete(null)}
                disabled={deletingEventId !== null}
                className="rounded-lg border border-gray-200 px-4 py-2.5 font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deletingEventId !== null}
                className="rounded-lg bg-red-600 px-4 py-2.5 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingEventId ? "Deleting..." : "Delete Event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EventTable;
