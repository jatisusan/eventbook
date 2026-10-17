"use client";

import api from "@/lib/axios";
import axios from "axios";
import EventForm from "@/components/admin/EventForm";
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

const CreateEventPage = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthLoading && (!user || user.role !== "ADMIN")) {
      router.replace("/");
    }
  }, [isAuthLoading, router, user]);

  const handleSubmit = async (values: EventFormValues) => {
    setError("");

    try {
      const response = await api.post("/events", values);
      toast.success(response.data.message || "Event created successfully.");
      router.push("/admin/events");
    } catch (requestError) {
      const message = axios.isAxiosError(requestError)
        ? requestError.response?.data?.message
        : undefined;
      setError(message || "Unable to create event. Please try again.");
      toast.error(message || "Unable to create event. Please try again.");
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
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Create Event</h1>
        <EventForm onSubmit={handleSubmit} error={error} />
      </div>
    </main>
  );
};

export default CreateEventPage;
