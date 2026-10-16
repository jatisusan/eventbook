import Link from "next/link";

export type Event = {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  venue: string;
  totalSeats: number;
  seatsLeft: number;
};

const EventCard = ({ event }: { event: Event }) => {
  const startsAt = new Date(event.startsAt);

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex h-40 items-center justify-center bg-[#F0F5F0]">
        <span className="text-5xl font-bold text-[#276749]">
          {event.title.charAt(0)}
        </span>
      </div>

      <div className="p-5">
        <p className="text-sm font-semibold text-[#276749]">
          {startsAt.toLocaleDateString()} ·{" "}
          {startsAt.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
        <h3 className="mt-2 text-xl font-bold">{event.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-gray-600">
          {event.description}
        </p>
        <p className="mt-4 text-sm text-gray-500">{event.venue}</p>

        <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="text-sm text-gray-500">
            {event.seatsLeft} of {event.totalSeats} seats left
          </span>
          <Link
            href={`/events/${event.id}`}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold transition hover:border-[#276749] hover:bg-green-50 hover:text-[#276749]"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
};

export default EventCard;
