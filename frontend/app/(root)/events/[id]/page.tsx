import EventDetails from "@/components/EventDetails";

export const instant = false;

const EventDetailsPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  return <EventDetails id={id} />;
};

export default EventDetailsPage;
