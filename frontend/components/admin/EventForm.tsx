"use client";

import type { Event } from "@/components/EventCard";
import { useState } from "react";

type EventFormValues = {
  title: string;
  description: string;
  startsAt: string;
  venue: string;
  totalSeats: string;
};

type EventFormProps = {
  initialEvent?: Event;
  onSubmit: (values: {
    title: string;
    description: string;
    startsAt: string;
    venue: string;
    totalSeats: number;
  }) => Promise<void>;
  error?: string;
};

const toDateTimeLocal = (value: string) => {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const EventForm = ({ initialEvent, onSubmit, error }: EventFormProps) => {
  const [values, setValues] = useState<EventFormValues>({
    title: initialEvent?.title ?? "",
    description: initialEvent?.description ?? "",
    startsAt: initialEvent ? toDateTimeLocal(initialEvent.startsAt) : "",
    venue: initialEvent?.venue ?? "",
    totalSeats: initialEvent ? String(initialEvent.totalSeats) : "1",
  });
  const [validationError, setValidationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof EventFormValues, value: string) => {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError("");

    const totalSeats = Number(values.totalSeats);
    const startsAt = new Date(values.startsAt);

    if (values.title.trim().length < 3 || values.title.trim().length > 150) {
      setValidationError("Title must be between 3 and 150 characters.");
      return;
    }

    if (!values.description.trim()) {
      setValidationError("Description is required.");
      return;
    }

    if (!values.startsAt || Number.isNaN(startsAt.getTime())) {
      setValidationError("Provide a valid event date and time.");
      return;
    }

    if (startsAt <= new Date()) {
      setValidationError("Event date and time must be in the future.");
      return;
    }

    if (values.venue.trim().length < 2 || values.venue.trim().length > 200) {
      setValidationError("Venue must be between 2 and 200 characters.");
      return;
    }

    if (!Number.isInteger(totalSeats) || totalSeats <= 0) {
      setValidationError("Total seats must be a positive whole number.");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        title: values.title.trim(),
        description: values.description.trim(),
        startsAt: startsAt.toISOString(),
        venue: values.venue.trim(),
        totalSeats,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
    >
      {(validationError || error) && (
        <p
          className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
          role="alert"
        >
          {validationError || error}
        </p>
      )}

      <label className="block">
        <span className="text-sm font-medium text-gray-700">Title</span>
        <input
          type="text"
          value={values.title}
          onChange={(event) => handleChange("title", event.target.value)}
          required
          maxLength={150}
          className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:ring-2 focus:ring-[#276749]/20"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-gray-700">Description</span>
        <textarea
          value={values.description}
          onChange={(event) => handleChange("description", event.target.value)}
          required
          rows={5}
          className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:ring-2 focus:ring-[#276749]/20"
        />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Date and time
          </span>
          <input
            type="datetime-local"
            value={values.startsAt}
            onChange={(event) => handleChange("startsAt", event.target.value)}
            required
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:ring-2 focus:ring-[#276749]/20"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Venue</span>
          <input
            type="text"
            value={values.venue}
            onChange={(event) => handleChange("venue", event.target.value)}
            required
            maxLength={200}
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:ring-2 focus:ring-[#276749]/20"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-gray-700">Total seats</span>
        <input
          type="number"
          min={1}
          step={1}
          value={values.totalSeats}
          onChange={(event) => handleChange("totalSeats", event.target.value)}
          required
          className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:ring-2 focus:ring-[#276749]/20"
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-[#276749] px-5 py-3 font-semibold text-white transition hover:bg-[#1F5139] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting
          ? "Saving..."
          : initialEvent
            ? "Save Changes"
            : "Create Event"}
      </button>
    </form>
  );
};

export default EventForm;
