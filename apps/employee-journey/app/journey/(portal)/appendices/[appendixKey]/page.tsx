import { getAppendixCrosswalk } from "../../../_generated/appendixFormCrosswalk.generated";
import { getAppendixForm } from "../../../_generated/appendixForms.generated";
import { AppendixFormPlayer } from "../../../_components/AppendixFormPlayer";
import { AppendixPacketNavigator } from "../../../_components/AppendixPacketNavigator";
import { AppendixStatusNotice } from "../../../_components/AppendixStatusNotice";

export default async function AppendixPage({
  params,
}: {
  params: Promise<{ appendixKey: string }>;
}) {
  const { appendixKey } = await params;
  const entry = getAppendixCrosswalk(appendixKey);

  if (!entry) {
    return <AppendixStatusNotice appendixKey={appendixKey} />;
  }

  if (entry.classification === "COMPOSITE_PACKET") {
    return <AppendixPacketNavigator entry={entry} />;
  }

  if (entry.classification === "EXACT_FORM") {
    const form = getAppendixForm(entry.formIds[0] ?? "");
    if (form) {
      return (
        <AppendixFormPlayer
          form={form}
          appendixEntry={entry}
          backHref="/journey"
          backLabel="Back"
        />
      );
    }
    // Safety net: crosswalk claims an exact form but it is missing from the
    // baked registry. Fail closed to a review-required notice rather than
    // fabricating a form.
    return <AppendixStatusNotice entry={entry} appendixKey={appendixKey} />;
  }

  return <AppendixStatusNotice entry={entry} appendixKey={appendixKey} />;
}
