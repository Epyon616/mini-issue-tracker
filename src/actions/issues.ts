// src/actions/issues.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addComment, createIssue, setIssueStatus } from "@/lib/issuesRepo";

const createIssueSchema = z.object({
  title: z.string().trim().min(3, "Title is too short"),
  body: z.string().trim().min(10, "Body is too short"),
});

export async function createIssueAction(formData: FormData) {
  const parsed = createIssueSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { ok: false as const, errors: parsed.error.flatten().fieldErrors };
  }

  const issue = await createIssue(parsed.data);
  revalidatePath("/issues");
  redirect(`/issues/${issue.id}`);
}

const commentSchema = z.object({
  body: z.string().trim().min(1, "Comment cannot be empty"),
});

export async function addCommentAction(issueId: string, formData: FormData) {
  const parsed = commentSchema.safeParse({ body: formData.get("body") });
  if (!parsed.success) {
    return { ok: false as const, errors: parsed.error.flatten().fieldErrors };
  }

  await addComment(issueId, parsed.data.body);
  revalidatePath(`/issues/${issueId}`);
  return { ok: true as const };
}

export async function setStatusAction(issueId: string, status: "OPEN" | "CLOSED") {
  await setIssueStatus(issueId, status);
  revalidatePath("/issues");
  revalidatePath(`/issues/${issueId}`);
}