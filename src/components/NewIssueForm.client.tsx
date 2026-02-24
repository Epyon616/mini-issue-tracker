"use client";

import { useState, useTransition } from "react";
import { createIssueAction } from "@/actions/issues";

export default function NewIssueForm() {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<{ title?: string[]; body?: string[] } | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createIssueAction(formData);
      // On success, action redirects. If we got here, it likely returned errors.
      if (res && "ok" in res && res.ok === false) setErrors(res.errors);
    });
  }

  return (
    <form className="stack" onSubmit={onSubmit}>
      <div className="stack" style={{ gap: 8 }}>
        <label className="subtle">Title</label>
        <input className="input" name="title" placeholder="Short summary…" />
        {errors?.title?.length ? <div className="error">{errors.title.join(", ")}</div> : null}
      </div>

      <div className="stack" style={{ gap: 8 }}>
        <label className="subtle">Body</label>
        <textarea className="textarea" name="body" placeholder="Describe the issue…" />
        {errors?.body?.length ? <div className="error">{errors.body.join(", ")}</div> : null}
      </div>

      <div className="row" style={{ justifyContent: "space-between" }}>
        <button className="btn primary" type="submit" disabled={isPending}>
          {isPending ? "Creating…" : "Create issue"}
        </button>
        <span className="subtle">Client state: inputs + pending + inline errors</span>
      </div>
    </form>
  );
}