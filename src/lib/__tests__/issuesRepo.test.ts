// src/lib/__tests__/issuesRepo.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "fs";
import path from "path";
import {
  listIssues,
  getIssue,
  getComments,
  createIssue,
  addComment,
  setIssueStatus,
} from "../issuesRepo";

const TEST_DB_DIR = path.join(process.cwd(), "data");
const TEST_DB_PATH = path.join(TEST_DB_DIR, "db.test.json");

// Setup test database
beforeEach(async () => {
  // Ensure clean database
  await fs.mkdir(TEST_DB_DIR, { recursive: true });
  await fs.writeFile(
    TEST_DB_PATH,
    JSON.stringify({ issues: [], comments: [] }),
    "utf-8"
  );
});

afterEach(async () => {
  try {
    await fs.unlink(TEST_DB_PATH);
  } catch {
    // ignore if file doesn't exist
  }
});

describe("issuesRepo", () => {
  describe("createIssue", () => {
    it("should create a new issue with correct fields", async () => {
      const input = {
        title: "Test Issue",
        body: "This is a test issue body",
      };

      const issue = await createIssue(input);

      expect(issue).toMatchObject({
        title: input.title,
        body: input.body,
        status: "OPEN",
      });
      expect(issue.id).toBeTruthy();
      expect(issue.createdAt).toBeTruthy();
      expect(issue.updatedAt).toBeTruthy();
    });

    it("should persist the issue to database", async () => {
      const input = {
        title: "Persisted Issue",
        body: "This should be saved",
      };

      const created = await createIssue(input);
      const retrieved = await getIssue(created.id);

      expect(retrieved).toMatchObject(created);
    });
  });

  describe("listIssues", () => {
    it("should return empty array when no issues exist", async () => {
      const issues = await listIssues();
      expect(issues).toEqual([]);
    });

    it("should return all issues sorted by updatedAt desc", async () => {
      await createIssue({ title: "First", body: "First issue" });
      await new Promise((r) => setTimeout(r, 10)); // ensure different timestamps
      await createIssue({ title: "Second", body: "Second issue" });

      const issues = await listIssues();

      expect(issues).toHaveLength(2);
      expect(issues[0].title).toBe("Second");
      expect(issues[1].title).toBe("First");
    });

    it("should filter by status", async () => {
      await createIssue({ title: "Open", body: "Open issue" });
      const issue2 = await createIssue({ title: "Closed", body: "Closed issue" });
      await setIssueStatus(issue2.id, "CLOSED");

      const openIssues = await listIssues({ status: "OPEN" });
      const closedIssues = await listIssues({ status: "CLOSED" });

      expect(openIssues).toHaveLength(1);
      expect(openIssues[0].title).toBe("Open");
      expect(closedIssues).toHaveLength(1);
      expect(closedIssues[0].title).toBe("Closed");
    });

    it("should filter by search query in title", async () => {
      await createIssue({ title: "Login Bug", body: "Description" });
      await createIssue({ title: "Signup Issue", body: "Description" });

      const results = await listIssues({ q: "login" });

      expect(results).toHaveLength(1);
      expect(results[0].title).toBe("Login Bug");
    });

    it("should filter by search query in body", async () => {
      await createIssue({ title: "Issue 1", body: "Safari browser bug" });
      await createIssue({ title: "Issue 2", body: "Chrome works fine" });

      const results = await listIssues({ q: "safari" });

      expect(results).toHaveLength(1);
      expect(results[0].title).toBe("Issue 1");
    });

    it("should handle case-insensitive search", async () => {
      await createIssue({ title: "UPPERCASE", body: "Test" });

      const results = await listIssues({ q: "uppercase" });

      expect(results).toHaveLength(1);
    });

    it("should combine status and search filters", async () => {
      await createIssue({ title: "Open Login", body: "Test" });
      const issue2 = await createIssue({ title: "Closed Login", body: "Test" });
      await setIssueStatus(issue2.id, "CLOSED");

      const results = await listIssues({ status: "OPEN", q: "login" });

      expect(results).toHaveLength(1);
      expect(results[0].title).toBe("Open Login");
    });
  });

  describe("getIssue", () => {
    it("should return null for non-existent issue", async () => {
      const issue = await getIssue("non-existent-id");
      expect(issue).toBeNull();
    });

    it("should return the correct issue by id", async () => {
      const created = await createIssue({ title: "Test", body: "Body" });
      const retrieved = await getIssue(created.id);

      expect(retrieved).toMatchObject(created);
    });
  });

  describe("setIssueStatus", () => {
    it("should update issue status to CLOSED", async () => {
      const issue = await createIssue({ title: "Test", body: "Body" });

      await setIssueStatus(issue.id, "CLOSED");
      const updated = await getIssue(issue.id);

      expect(updated?.status).toBe("CLOSED");
    });

    it("should update issue status to OPEN", async () => {
      const issue = await createIssue({ title: "Test", body: "Body" });
      await setIssueStatus(issue.id, "CLOSED");

      await setIssueStatus(issue.id, "OPEN");
      const updated = await getIssue(issue.id);

      expect(updated?.status).toBe("OPEN");
    });

    it("should update updatedAt timestamp", async () => {
      const issue = await createIssue({ title: "Test", body: "Body" });
      const originalUpdatedAt = issue.updatedAt;

      await new Promise((r) => setTimeout(r, 10));
      await setIssueStatus(issue.id, "CLOSED");
      const updated = await getIssue(issue.id);

      expect(updated?.updatedAt).not.toBe(originalUpdatedAt);
    });

    it("should throw error for non-existent issue", async () => {
      await expect(setIssueStatus("non-existent", "CLOSED")).rejects.toThrow(
        "Issue not found"
      );
    });
  });

  describe("addComment", () => {
    it("should add a comment to an issue", async () => {
      const issue = await createIssue({ title: "Test", body: "Body" });

      const comment = await addComment(issue.id, "This is a comment");

      expect(comment).toMatchObject({
        issueId: issue.id,
        body: "This is a comment",
      });
      expect(comment.id).toBeTruthy();
      expect(comment.createdAt).toBeTruthy();
    });

    it("should update issue updatedAt when comment is added", async () => {
      const issue = await createIssue({ title: "Test", body: "Body" });
      const originalUpdatedAt = issue.updatedAt;

      await new Promise((r) => setTimeout(r, 10));
      await addComment(issue.id, "Comment");
      const updated = await getIssue(issue.id);

      expect(updated?.updatedAt).not.toBe(originalUpdatedAt);
    });

    it("should throw error for non-existent issue", async () => {
      await expect(addComment("non-existent", "Comment")).rejects.toThrow(
        "Issue not found"
      );
    });
  });

  describe("getComments", () => {
    it("should return empty array when no comments exist", async () => {
      const issue = await createIssue({ title: "Test", body: "Body" });
      const comments = await getComments(issue.id);

      expect(comments).toEqual([]);
    });

    it("should return comments for an issue sorted by createdAt asc", async () => {
      const issue = await createIssue({ title: "Test", body: "Body" });

      await addComment(issue.id, "First comment");
      await new Promise((r) => setTimeout(r, 10));
      await addComment(issue.id, "Second comment");

      const comments = await getComments(issue.id);

      expect(comments).toHaveLength(2);
      expect(comments[0].body).toBe("First comment");
      expect(comments[1].body).toBe("Second comment");
    });

    it("should only return comments for the specified issue", async () => {
      const issue1 = await createIssue({ title: "Issue 1", body: "Body" });
      const issue2 = await createIssue({ title: "Issue 2", body: "Body" });

      await addComment(issue1.id, "Comment on issue 1");
      await addComment(issue2.id, "Comment on issue 2");

      const comments = await getComments(issue1.id);

      expect(comments).toHaveLength(1);
      expect(comments[0].body).toBe("Comment on issue 1");
    });
  });
});
