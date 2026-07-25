import { notFound } from "next/navigation";
import { getHandbookSection } from "../../../../_lib/handbook";
import { HandbookReader } from "../../../../_components/HandbookReader";

export default async function HandbookSectionPage({
  params,
}: {
  params: Promise<{ sectionId: string }>;
}) {
  const { sectionId } = await params;
  const section = getHandbookSection(sectionId);
  if (!section) notFound();
  return <HandbookReader section={section} />;
}
