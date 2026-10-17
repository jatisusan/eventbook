import EditEventPage from "@/components/admin/EditEventPage";

export const instant = false;

const EditEventRoute = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  return <EditEventPage id={id} />;
};

export default EditEventRoute;
