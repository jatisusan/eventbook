"use client";

import api from "@/lib/axios";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Event } from "@/components/EventCard";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type Booking = {
  id: string;
  userId: string;
  eventId: string;
  status: "CONFIRMED" | "CANCELLED";
};

type AdminBooking = {
  id: string;
  status: "CONFIRMED" | "CANCELLED";
  createdAt: string;
  cancelledAt: string | null;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

const EventDetails = ({ id }: { id: string }) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasBooking, setHasBooking] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [isCancellationLoading, setIsCancellationLoading] = useState(false);
  const [adminBookings, setAdminBookings] = useState<AdminBooking[]>([]);
  const [isAdminBookingsLoading, setIsAdminBookingsLoading] = useState(false);
  const [adminBookingsError, setAdminBookingsError] = useState("");
  const { user, isLoading: isAuthLoading } = useAuth();
  const loadedEventId = event?.id;

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const response = await api.get(`/events/${id}`);
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

  useEffect(() => {
    if (isAuthLoading || isLoading || !loadedEventId || !user) {
      return;
    }

    const loadBookings = async () => {
      if (user.role === "ADMIN") {
        setIsAdminBookingsLoading(true);
        setAdminBookingsError("");

        try {
          const response = await api.get(`/events/${id}/bookings`);
          setAdminBookings(response.data.data);
        } catch {
          setAdminBookingsError("Unable to load booking users.");
        } finally {
          setIsAdminBookingsLoading(false);
        }

        return;
      }

      try {
        const response = await api.get("/bookings");
        const currentBooking = response.data.data.find(
          (booking: Booking) =>
            booking.eventId === id && booking.status === "CONFIRMED",
        );
        setHasBooking(Boolean(currentBooking));
        setBookingId(currentBooking?.id ?? null);
      } catch (requestError) {
        if (
          !axios.isAxiosError(requestError) ||
          requestError.response?.status !== 401
        ) {
          console.error(
            "Unable to check the current user's booking.",
            requestError,
          );
        }
      }
    };

    void loadBookings();
  }, [id, isAuthLoading, isLoading, loadedEventId, user]);

  const handleBooking = async () => {
    setIsBookingLoading(true);

    try {
      const response = await api.post("/bookings", { eventId: id });
      setHasBooking(true);
      setBookingId(response.data.data.id);
      setEvent((currentEvent) =>
        currentEvent
          ? {
              ...currentEvent,
              seatsLeft: Math.max(0, currentEvent.seatsLeft - 1),
            }
          : currentEvent,
      );
      toast.success(response.data.message || "Booking created successfully.");
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        toast.error(
          requestError.response?.data?.message ||
            "Unable to book this event. Please try again.",
        );
      } else {
        toast.error("Unable to book this event. Please try again.");
      }
    } finally {
      setIsBookingLoading(false);
    }
  };

  const handleCancellation = async () => {
    if (!bookingId) {
      return;
    }

    setIsCancellationLoading(true);

    try {
      const response = await api.patch(`/bookings/${bookingId}/cancel`);
      setHasBooking(false);
      setBookingId(null);
      setEvent((currentEvent) =>
        currentEvent
          ? { ...currentEvent, seatsLeft: currentEvent.seatsLeft + 1 }
          : currentEvent,
      );
      toast.success(response.data.message || "Booking cancelled successfully.");
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        toast.error(
          requestError.response?.data?.message ||
            "Unable to cancel this booking. Please try again.",
        );
      } else {
        toast.error("Unable to cancel this booking. Please try again.");
      }
    } finally {
      setIsCancellationLoading(false);
    }
  };

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

            {!isAuthLoading && user?.role === "USER" && (
              <div className="mt-8 border-t border-gray-100 pt-6">
                {hasBooking ? (
                  <button
                    type="button"
                    onClick={handleCancellation}
                    disabled={isCancellationLoading}
                    className="rounded-lg border border-red-200 px-5 py-3 font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isCancellationLoading ? "Cancelling..." : "Cancel Booking"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleBooking}
                    disabled={isBookingLoading || event.seatsLeft === 0}
                    className="rounded-lg bg-[#276749] px-5 py-3 font-semibold text-white transition hover:bg-[#1F5139] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isBookingLoading
                      ? "Booking..."
                      : event.seatsLeft === 0
                        ? "Event is full"
                        : "Book Event"}
                  </button>
                )}
              </div>
            )}

            {!isAuthLoading && !user && (
              <p className="mt-8 border-t border-gray-100 pt-6 text-gray-600">
                <Link
                  href="/login"
                  className="font-semibold text-[#276749] hover:underline"
                >
                  Log in
                </Link>{" "}
                to book this event.
              </p>
            )}
          </div>
        </article>
      )}

      {!isAuthLoading && user?.role === "ADMIN" && !isLoading && !error && (
        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold">Booking users</h2>
          {isAdminBookingsLoading && (
            <p className="mt-4 text-gray-500" role="status">
              Loading booking users...
            </p>
          )}
          {!isAdminBookingsLoading && adminBookingsError && (
            <p className="mt-4 text-red-600" role="alert">
              {adminBookingsError}
            </p>
          )}
          {!isAdminBookingsLoading &&
            !adminBookingsError &&
            adminBookings.length === 0 && (
              <p className="mt-4 text-gray-500">
                No users have booked this event.
              </p>
            )}
          {!isAdminBookingsLoading &&
            !adminBookingsError &&
            adminBookings.length > 0 && (
              <ul className="mt-4 divide-y divide-gray-100">
                {adminBookings.map((booking) => (
                  <li
                    key={booking.id}
                    className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="font-medium">{booking.user.name}</span>
                    <span className="text-sm text-gray-500">
                      {booking.user.email}
                    </span>
                  </li>
                ))}
              </ul>
            )}
        </section>
      )}
    </section>
  );
};

export default EventDetails;
