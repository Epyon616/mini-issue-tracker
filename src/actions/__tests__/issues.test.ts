// src/actions/__tests__/issues.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

// Mock Next.js functions
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

// Mock the repo functions
vi.mock("@/lib/issuesRepo", () => ({
  createIssue: vi.fn(),
  addComment: vi.fn(),
  setIssueStatus: vi.fn(),
}));

import { createIssueAction, addCommentAction, setStatusAction } from "../issues";
import { createIssue, addComment, setIssueStatus } from "@/lib/issuesRepo";
import { revalidatePath } from "next/cache";

describe("issues actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createIssueAction", () => {
    it("should validate and create issue with valid data", async () => {
      const mockIssue = {
        id: "test-id",
        title: "Valid Title",
        body: "This is a valid body with enough characters",
        status: "OPEN" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.mocked(createIssue).mockResolvedValue(mockIssue);

      const formData = new FormData();
      formData.append("title", "Valid Title");
      formData.append("body", "This is a valid body with enough characters");

      try {
        await createIssueAction(formData);
      } catch (error: any) {
        // Expect redirect to be called
        expect(error.message).toBe(`REDIRECT:/issues/${mockIssue.id}`);
      }

      expect(createIssue).toHaveBeenCalledWith({
        title: "Valid Title",
        body: "This is a valid body with enough characters",
      });
      expect(revalidatePath).toHaveBeenCalledWith("/issues");
    });

    it("should return errors for title too short", async () => {
      const formData = new FormData();
      formData.append("title", "ab");
      formData.append("body", "Valid body text");

      const result = await createIssueAction(formData);

      expect(result).toEqual({
        ok: false,
        errors: expect.objectContaining({
          title: expect.arrayContaining(["Title is too short"]),
        }),
      });
      expect(createIssue).not.toHaveBeenCalled();
    });

    it("should return errors for body too short", async () => {
      const formData = new FormData();
      formData.append("title", "Valid Title");
      formData.append("body", "short");

      const result = await createIssueAction(formData);

      expect(result).toEqual({
        ok: false,
        errors: expect.objectContaining({
          body: expect.arrayContaining(["Body is too short"]),
        }),
      });
      expect(createIssue).not.toHaveBeenCalled();
    });

    it("should trim whitespace from title and body", async () => {
      const mockIssue = {
        id: "test-id",
        title: "Trimmed Title",
        body: "Trimmed body text",
        status: "OPEN" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.mocked(createIssue).mockResolvedValue(mockIssue);

      const formData = new FormData();
      formData.append("title", "  Trimmed Title  ");
      formData.append("body", "  Trimmed body text  ");

      try {
        await createIssueAction(formData);
      } catch (error: any) {
        // Expect redirect
        expect(error.message).toContain("REDIRECT:");
      }

      expect(createIssue).toHaveBeenCalledWith({
        title: "Trimmed Title",
        body: "Trimmed body text",
      });
    });

    it("should return errors for missing fields", async () => {
      const formData = new FormData();

      const result = await createIssueAction(formData);

      expect(result).toEqual({
        ok: false,
        errors: expect.objectContaining({
          title: expect.any(Array),
          body: expect.any(Array),
        }),
      });
    });
  });

  describe("addCommentAction", () => {
    it("should validate and add comment with valid data", async () => {
      const mockComment = {
        id: "comment-id",
        issueId: "issue-123",
        body: "Valid comment",
        createdAt: new Date().toISOString(),
      };

      vi.mocked(addComment).mockResolvedValue(mockComment);

      const formData = new FormData();
      formData.append("body", "Valid comment");

      const result = await addCommentAction("issue-123", formData);

      expect(result).toEqual({ ok: true });
      expect(addComment).toHaveBeenCalledWith("issue-123", "Valid comment");
      expect(revalidatePath).toHaveBeenCalledWith("/issues/issue-123");
    });

    it("should return errors for empty comment", async () => {
      const formData = new FormData();
      formData.append("body", "");

      const result = await addCommentAction("issue-123", formData);

      expect(result).toEqual({
        ok: false,
        errors: expect.objectContaining({
          body: expect.arrayContaining(["Comment cannot be empty"]),
        }),
      });
      expect(addComment).not.toHaveBeenCalled();
    });

    it("should return errors for whitespace-only comment", async () => {
      const formData = new FormData();
      formData.append("body", "   ");

      const result = await addCommentAction("issue-123", formData);

      expect(result).toEqual({
        ok: false,
        errors: expect.objectContaining({
          body: expect.arrayContaining(["Comment cannot be empty"]),
        }),
      });
      expect(addComment).not.toHaveBeenCalled();
    });

    it("should trim whitespace from comment body", async () => {
      const mockComment = {
        id: "comment-id",
        issueId: "issue-123",
        body: "Trimmed comment",
        createdAt: new Date().toISOString(),
      };

      vi.mocked(addComment).mockResolvedValue(mockComment);

      const formData = new FormData();
      formData.append("body", "  Trimmed comment  ");

      const result = await addCommentAction("issue-123", formData);

      expect(result).toEqual({ ok: true });
      expect(addComment).toHaveBeenCalledWith("issue-123", "Trimmed comment");
    });
  });

  describe("setStatusAction", () => {
    it("should set status to OPEN", async () => {
      const mockIssue = {
        id: "issue-123",
        title: "Test",
        body: "Body",
        status: "OPEN" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.mocked(setIssueStatus).mockResolvedValue(mockIssue);

      await setStatusAction("issue-123", "OPEN");

      expect(setIssueStatus).toHaveBeenCalledWith("issue-123", "OPEN");
      expect(revalidatePath).toHaveBeenCalledWith("/issues");
      expect(revalidatePath).toHaveBeenCalledWith("/issues/issue-123");
    });

    it("should set status to CLOSED", async () => {
      const mockIssue = {
        id: "issue-123",
        title: "Test",
        body: "Body",
        status: "CLOSED" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.mocked(setIssueStatus).mockResolvedValue(mockIssue);

      await setStatusAction("issue-123", "CLOSED");

      expect(setIssueStatus).toHaveBeenCalledWith("issue-123", "CLOSED");
      expect(revalidatePath).toHaveBeenCalledWith("/issues");
      expect(revalidatePath).toHaveBeenCalledWith("/issues/issue-123");
    });
  });
});
