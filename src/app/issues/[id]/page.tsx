import { Suspense } from "react";
import Link from "next/link";
import { getIssue } from "@/lib/issuesRepo";
import CommentThread from "@/components/CommentThread";
import CommentComposer from "@/components/CommentComposer.client";
import StatusToggle from "@/components/StatusToggle.client";
import IssueNotFound from "@/components/IssueNotFound";

type IssuePageProps = { params: Promise<{ id: string }>};

export default async function IssuePage({ params }: IssuePageProps) {
  const { id } = await params;
  const issue = await getIssue(id);


  if (!issue) return <IssueNotFound />

  return (
    <main className="stack" style={{ marginTop: 18 }}>
      <header className="header">
        <div className="stack" style={{ gap: 6 }}>
          <div className="row" style={{ gap: 10 }}>
            <Link href="/issues" className="subtle">
              ← Issues
            </Link>
            <span className={`badge ${issue.status === "OPEN" ? "open" : "closed"}`}>
              {issue.status}
            </span>
          </div>

          <h1 className="h1" style={{ marginTop: 0 }}>
            {issue.title}
          </h1>

          <div className="subtle">
            Created {new Date(issue.createdAt).toLocaleString()} • Updated{" "}
            {new Date(issue.updatedAt).toLocaleString()}
          </div>
        </div>

        <StatusToggle issueId={issue.id} currentStatus={issue.status} />
      </header>

      <section className="panel">
        <p style={{ margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{issue.body}</p>
      </section>

      <section className="panel stack">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Comments</h2>
          <span className="subtle">RSC thread + client composer</span>
        </div>

        <Suspense fallback={<div className="subtle">Loading comments…</div>}>
          <CommentThread issueId={issue.id} />
        </Suspense>

        <hr className="hr" />

        <CommentComposer issueId={issue.id} />
      </section>
    </main>
  );
}