import Link from "next/link";
import { listIssues } from "@/lib/issuesRepo";

type SearchParamsProps = {
  searchParams: Promise<{ status?: string; q?: string }>;
};

export default async function IssuesPage({ searchParams }: SearchParamsProps) {
  const { status, q } = await searchParams;
  const searchStatus =
    status === "OPEN" || status === "CLOSED"
      ? (status as "OPEN" | "CLOSED")
      : undefined;

  const queryParams = typeof q === "string" ? q : undefined;

  const issues = await listIssues({ status: searchStatus, q: queryParams });
  const statusValue = searchStatus ?? "";
  const qValue = queryParams ?? "";

  return (
    <main className="stack" style={{ marginTop: 18 }}>
      <header className="header">
        <div>
          <h1 className="h1">Issues</h1>
          <div className="subtle">{issues.length} total</div>
        </div>

        <Link className="btn primary" href="/new">
          New issue
        </Link>
      </header>

      <section className="panel stack">
        {/* URL-state filters (no useState) */}
        <form method="GET" className="row" style={{ gap: 10 }}>
          <select
            className="select"
            name="status"
            defaultValue={statusValue}
            style={{ maxWidth: 180 }}
          >
            <option value="">All</option>
            <option value="OPEN">Open</option>
            <option value="CLOSED">Closed</option>
          </select>

          <input
            className="input"
            name="q"
            defaultValue={qValue}
            placeholder="Search title/body…"
          />

          <button className="btn" type="submit">
            Apply
          </button>

          <Link className="btn" href="/issues">
            Reset
          </Link>
        </form>
      </section>

      <section className="list">
        {issues.map((issue) => (
          <Link key={issue.id} href={`/issues/${issue.id}`} className="card">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <h3 className="title">{issue.title}</h3>
              <span
                className={`badge ${issue.status === "OPEN" ? "open" : "closed"}`}
              >
                {issue.status}
              </span>
            </div>
            <div className="meta">
              <span>Updated: {new Date(issue.updatedAt).toLocaleString()}</span>
              <span>Created: {new Date(issue.createdAt).toLocaleString()}</span>
            </div>
          </Link>
        ))}

        {issues.length === 0 && (
          <div className="panel">
            <div className="subtle">
              No issues found for the current filters.
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
