// src/lib/issuesRepo.ts
import { nanoid } from "nanoid";
import { getDb, IssueStatus } from "./db";

export async function listIssues(
  params: { status?: IssueStatus; q?: string } = {},
) {
  const db = await getDb();
  const q = params.q?.toLowerCase().trim();

  return db.data.issues
    .filter((i) => (params.status ? i.status === params.status : true))
    .filter((i) =>
      q ? (i.title + " " + i.body).toLowerCase().includes(q) : true,
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getIssue(id: string) {
  const db = await getDb();
  return db.data.issues.find((i) => i.id === id) ?? null;
}

export async function getComments(issueId: string) {
  const db = await getDb();
  return db.data.comments
    .filter((c) => c.issueId === issueId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function createIssue(input: { title: string; body: string }) {
  const db = await getDb();
  const now = new Date().toISOString();
  const issue = {
    id: nanoid(),
    title: input.title,
    body: input.body,
    status: "OPEN" as const,
    createdAt: now,
    updatedAt: now,
  };

  db.data.issues.push(issue);
  await db.write();
  return issue;
}

export async function addComment(issueId: string, body: string) {
  const db = await getDb();
  const issue = db.data.issues.find((i) => i.id === issueId);
  if (!issue) throw new Error("Issue not found");

  const now = new Date().toISOString();
  const comment = { id: nanoid(), issueId, body, createdAt: now };
  db.data.comments.push(comment);

  issue.updatedAt = now;
  await db.write();
  return comment;
}

export async function setIssueStatus(issueId: string, status: IssueStatus) {
  const db = await getDb();
  const issue = db.data.issues.find((i) => i.id === issueId);
  if (!issue) throw new Error("Issue not found");

  issue.status = status;
  issue.updatedAt = new Date().toISOString();
  await db.write();
  return issue;
}
