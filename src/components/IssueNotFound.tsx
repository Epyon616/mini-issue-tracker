import Link from "next/link";

export default function IssueNotFound() {
  return (
            <main className="stack" style={{ marginTop: 18 }}>
        <div className="panel">
          <h1 className="h1">Not found</h1>
          <p className="subtle">That issue doesn’t exist.</p>
          <Link href="/issues" className="btn">
            Back to issues
          </Link>
        </div>
      </main>
  );
}