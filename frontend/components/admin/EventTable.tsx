import Link from "next/link";
import type { Event } from "@/components/EventCard";

const EventTable = ({ events }: { events: Event[] }) => {
  return (
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
          {events.map((event) => (
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EventTable