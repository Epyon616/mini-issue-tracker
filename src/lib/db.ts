// src/lib/db.ts
import { JSONFilePreset } from "lowdb/node";
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

// File location (outside src so it’s clearly “data”)
const dbFile = path.join(process.cwd(), "data", "db.json");

async function ensureDbFile() {
  try {
    await fs.access(dbFile);
  } catch {
    await fs.mkdir(path.dirname(dbFile), { recursive: true });
    await fs.writeFile(dbFile, JSON.stringify({ issues: [], comments: [] }, null, 2), "utf-8");
  }
}

// Singleton-ish DB loader
export async function getDb() {
  await ensureDbFile();
  // JSONFilePreset loads + writes automatically with db.write()
  return JSONFilePreset<Data>(dbFile, { issues: [], comments: [] });
}