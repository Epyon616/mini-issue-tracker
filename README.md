# 🧾 Mini Issue Tracker

A minimal issue tracker built with **Next.js App Router**, demonstrating:

- ✅ React Server Components (RSC)
- ✅ Server Actions
- ✅ Server state vs Client UI state
- ✅ URL-based state (search params)
- ✅ Revalidation & cache invalidation patterns

No Prisma. No heavy database setup.  
Server state is persisted via a file-backed JSON store for simplicity.

---

## 🚀 Tech Stack

- **Next.js (App Router)**
- **React Server Components**
- **Server Actions**
- **lowdb (JSON file persistence)**
- **Zod (validation)**
- **nanoid (IDs)**

---

## 🧠 Architecture Overview

### 1️⃣ React Server Components (RSC)

The following are Server Components:

- `/issues` – Issues list page  
- `/issues/[id]` – Issue detail page  
- `CommentThread` – Comment rendering  

These components:

- Fetch data directly from the server datastore
- Do not ship JavaScript to the client
- Re-render after server mutations via `revalidatePath`

This keeps the JS bundle minimal and improves performance.

---

### 2️⃣ Client Components (Interactive Islands)

Only interactive UI lives on the client:

- `NewIssueForm`
- `CommentComposer`
- `StatusToggle`

These components:

- Use `useState` and `useTransition`
- Call server actions
- Handle pending state and validation errors
- Provide optimistic UI (clears comment input immediately)

This keeps client JS small and intentional.

---

### 3️⃣ Server State

Server state includes:

- Issues
- Comments
- Issue status

Data is stored in:
