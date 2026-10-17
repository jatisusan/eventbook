"use client";

import api from "@/lib/axios";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type Booking = {
  id: string;
  status: "CONFIRMED" | "CANCELLED";
  createdAt: string;
  cancelledAt: string | null;
  event: {
    id: string;
    title: string;
    startsAt: string;
    venue: string;
  };
};

const formatEventDate = (startsAt: string) =>
  `${new Date(startsAt).toLocaleDateString()} · ${new Date(
    startsAt,
  ).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;

const BookingsPage = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role === "ADMIN") {
      router.replace("/");
    }
  }, [isAuthLoading, router, user]);

  useEffect(() => {
    if (isAuthLoading || !user || user.role !== "USER") {
      return;
    }

    const loadBookings = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await api.get<{ data: Booking[] }>("/bookings");
        setBookings(response.data.data);
      } catch (requestError) {
        setError("Unable to load your bookings. Please try again.");
        if (
          !axios.isAxiosError(requestError) ||
          requestError.response?.status !== 401
        ) {
          console.error("Unable to load the current user's bookings.", requestError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    void loadBookings();
  }, [isAuthLoading, retryCount, user]);

  const handleCancellation = async (bookingId: string) => {
    if (cancellingBookingId) {
      return;
    }

    setCancellingBookingId(bookingId);

    try {
      const response = await api.patch(`/bookings/${bookingId}/cancel`);
      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                status: "CANCELLED",
                cancelledAt: response.data.data.cancelledAt,
              }
            : booking,
        ),
      );
      toast.success(
        response.data.message || "Booking cancelled successfully.",
      );
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
      setCancellingBookingId(null);
    }
  };

  if (isAuthLoading || !user || user.role === "ADMIN") {
    return (
      <p className="text-gray-500" role="status">
        Loading...
      </p>
    );
  }

  return (
    <section className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold">My Bookings</h1>
      <p className="mt-2 text-gray-600">
        Keep track of the events you have booked.
      </p>

      {isLoading && (
        <p className="mt-8 text-gray-500" role="status">
          Loading bookings...
        </p>
      )}

      {!isLoading && error && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8">
          <p className="text-red-600" role="alert">
            {error}
          </p>
          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
            className="mt-4 rounded-lg bg-[#276749] px-4 py-2.5 font-semibold text-white transition hover:bg-[#1F5139]"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !error && bookings.length === 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8">
          <p className="text-gray-600">You have not booked any events yet.</p>
          <Link
            href="/#events"
            className="mt-4 inline-block font-semibold text-[#276749] hover:underline"
          >
            Browse events
          </Link>
        </div>
      )}

      {!isLoading && !error && bookings.length > 0 && (
        <ul className="mt-8 space-y-4">
          {bookings.map((booking) => {
            const canCancel =
              booking.status === "CONFIRMED" &&
              new Date(booking.event.startsAt) > new Date();

            return (
              <li
                key={booking.id}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <Link
                      href={`/events/${booking.event.id}`}
                      className="text-xl font-bold hover:text-[#276749]"
                    >
                      {booking.event.title}
                    </Link>
                    <p className="mt-2 text-sm font-semibold text-[#276749]">
                      {formatEventDate(booking.event.startsAt)}
                    </p>
                    <p className="mt-1 text-gray-600">{booking.event.venue}</p>
                    <p className="mt-3 text-xs text-gray-500">
                      Booked on {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                      booking.status === "CONFIRMED"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>

                {canCancel && (
                  <button
                    type="button"
                    onClick={() => void handleCancellation(booking.id)}
                    disabled={cancellingBookingId !== null}
                    className="mt-5 rounded-lg border border-red-200 px-4 py-2.5 font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {cancellingBookingId === booking.id
                      ? "Cancelling..."
                      : "Cancel Booking"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default BookingsPage;