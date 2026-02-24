"use client";

import { useTransition } from "react";
import { setStatusAction } from "@/actions/issues";

export default function StatusToggle({
  issueId,
  currentStatus,
}: {
  issueId: string;
  currentStatus: "OPEN" | "CLOSED";
}) {
  const [isPending, startTransition] = useTransition();

  const nextStatus = currentStatus === "OPEN" ? "CLOSED" : "OPEN";
  const label = currentStatus === "OPEN" ? "Close issue" : "Reopen issue";

  return (
    <button
      className={`btn ${currentStatus === "OPEN" ? "danger" : "primary"}`}
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await setStatusAction(issueId, nextStatus);
        })
      }
      title="Client island → server action → revalidate list + detail"
    >
      {isPending ? "Saving…" : label}
    </button>
  );
}