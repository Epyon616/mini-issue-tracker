// src/lib/db.ts
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
import fs from "fs/promises";

export type IssueStatus = "OPEN" | "CLOSED";

export type Comment = {
  id: string;
  issueId: string;
  body: string;
  createdAt: string; // ISO
};

export type Issue = {
  id: string;
  title: string;
  body: string;
  status: IssueStatus;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

type Data = {
  issues: Issue[];
  comments: Comment[];
};

// File location (outside src so it's clearly "data")
const dbFile =
  process.env.NODE_ENV === "test"
    ? path.join(process.cwd(), "data", "db.test.json")
    : path.join(process.cwd(), "data", "db.json");

async function ensureDbFile() {
  try {
    await fs.access(dbFile);
  } catch {
    await fs.mkdir(path.dirname(dbFile), { recursive: true });
    await fs.writeFile(dbFile, JSON.stringify({ issues: [], comments: [] }, null, 2), "utf-8");
  }
}

// DB loader - always reads fresh from file
export async function getDb() {
  await ensureDbFile();
  const adapter = new JSONFile<Data>(dbFile);
  const db = new Low<Data>(adapter, { issues: [], comments: [] });
  await db.read();
  return db;
}
