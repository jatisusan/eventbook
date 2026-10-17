"use client";

import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import type { Event } from "@/components/EventCard";
import EventTable from "@/components/admin/EventTable";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const AdminEventsPage = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!user || user.role !== "ADMIN") {
      router.replace("/");
    }
  }, [isAuthLoading, router, user]);

  useEffect(() => {
    if (isAuthLoading || !user || user.role !== "ADMIN") {
      return;
    }

    const loadEvents = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await api.get("/events", {
          params: { page, limit: 3 },
        });
        setEvents(response.data.data);
        setTotalPages(response.data.totalPages);
      } catch {
        setError("Unable to load events. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadEvents();
  }, [isAuthLoading, page, user]);

  const handleEventDeleted = (eventId: string) => {
    setEvents((currentEvents) => {
      if (currentEvents.length === 1 && page > 1) {
        setPage(page - 1);
      }

      return currentEvents.filter((event) => event.id !== eventId);
    });
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
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-[#276749]">
              Administration
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Manage Events
            </h1>
          </div>
          <Link
            href="/admin/events/new"
            className="w-fit rounded-lg bg-[#276749] px-4 py-2.5 font-semibold text-white transition hover:bg-[#1F5139]"
          >
            Create Event
          </Link>
        </div>

        {isLoading && (
          <p className="mt-8 text-gray-500" role="status">
            Loading events...
          </p>
        )}

        {!isLoading && !error && events.length === 0 && (
          <p className="mt-8 text-gray-500">
            No upcoming events are available.
          </p>
        )}

        {!isLoading && !error && events.length > 0 && (
          <EventTable
            events={events}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            onEventDeleted={handleEventDeleted}
          />
        )}
      </div>
    </main>
  );
};

export default AdminEventsPage;
