"use client";

import api from "@/lib/axios";
import axios from "axios";
import EventForm from "@/components/admin/EventForm";
import type { Event } from "@/components/EventCard";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type EventFormValues = {
  title: string;
  description: string;
  startsAt: string;
  venue: string;
  totalSeats: number;
};

const EditEventPage = ({ id }: { id: string }) => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthLoading && (!user || user.role !== "ADMIN")) {
      router.replace("/");
    }
  }, [isAuthLoading, router, user]);

  useEffect(() => {
    if (isAuthLoading || !user || user.role !== "ADMIN") {
      return;
    }

    const loadEvent = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await api.get(`/events/${id}`);
        setEvent(response.data.data);
      } catch (requestError) {
        const message =
          axios.isAxiosError(requestError) &&
          requestError.response?.status === 404
            ? "Event not found."
            : "Unable to load this event. Please try again.";

        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadEvent();
  }, [id, isAuthLoading, user]);

  const handleSubmit = async (values: EventFormValues) => {
    setError("");

    try {
      const response = await api.patch(`/events/${id}`, values);
      toast.success(response.data.message || "Event updated successfully.");
      router.push("/admin/events");
    } catch (requestError) {
      const message = axios.isAxiosError(requestError)
        ? requestError.response?.data?.message
        : undefined;
      setError(message || "Unable to update event. Please try again.");
      toast.error(message || "Unable to update event. Please try again.");
    }
  };

  if (isAuthLoading || !user || user.role !== "ADMIN") {
    return (
      <p className="p-8 text-gray-500" role="status">
        Loading...
      </p>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAF8] px-5 py-10 text-[#20231F] sm:px-10 md:px-16">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-[#276749]">
          Administration
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Edit Event</h1>

        {isLoading && (
          <p className="mt-8 text-gray-500" role="status">
            Loading event...
          </p>
        )}

        {!isLoading && error && !event && (
          <p className="mt-8 text-red-600" role="alert">
            {error}
          </p>
        )}

        {!isLoading && event && (
          <EventForm
            initialEvent={event}
            onSubmit={handleSubmit}
            error={error}
          />
        )}
      </div>
    </main>
  );
};

export default EditEventPage;
