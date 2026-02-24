import { getComments } from "@/lib/issuesRepo";

export default async function CommentThread({ issueId }: { issueId: string }) {
  const comments = await getComments(issueId);

  if (comments.length === 0) {
    return <div className="subtle">No comments yet.</div>;
  }

  return (
    <div className="stack">
      {comments.map((c) => (
        <div key={c.id} className="card">
          <div className="meta" style={{ marginTop: 0, marginBottom: 8 }}>
            <span>{new Date(c.createdAt).toLocaleString()}</span>
          </div>
          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{c.body}</div>
        </div>
      ))}
    </div>
  );
}