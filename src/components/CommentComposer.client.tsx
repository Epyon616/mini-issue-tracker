"use client";

import { useMemo, useState, useTransition } from "react";
import { addCommentAction } from "@/actions/issues";

export default function CommentComposer({ issueId }: { issueId: string }) {
  const [isPending, startTransition] = useTransition();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => body.trim().length > 0 && !isPending, [body, isPending]);

  function submit() {
    setError(null);
    const optimistic = body;
    setBody(""); // optimistic clear

    const fd = new FormData();
    fd.set("body", optimistic);

    startTransition(async () => {
      const res = await addCommentAction(issueId, fd);
      if (res && "ok" in res && res.ok === false) {
        setError(res.errors.body?.[0] ?? "Could not add comment");
        // restore if server rejected
        setBody(optimistic);
      }
    });
  }

  return (
    <div className="stack">
      <div className="stack" style={{ gap: 8 }}>
        <label className="subtle">Add a comment</label>
        <textarea
          className="textarea"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write something…"
        />
        {error ? <div className="error">{error}</div> : null}
      </div>

      <div className="row" style={{ justifyContent: "space-between" }}>
        <button className="btn primary" disabled={!canSubmit} onClick={submit} type="button">
          {isPending ? "Posting…" : "Post comment"}
        </button>
        <span className="subtle">Optimistic: clears input immediately</span>
      </div>
    </div>
  );
}