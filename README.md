# Mini Issue Tracker

A minimal issue tracker built with Next.js (App Router) to demonstrate modern, server-first React architecture:

- React Server Components (RSC)
- Server Actions
- Clear separation of server state vs UI state
- URL-driven view state
- Explicit revalidation after mutations

The focus of this project is architectural clarity rather than feature breadth.

---

## Architecture

### Server Components (Default)

- `/issues` — issue list  
- `/issues/[id]` — issue detail  
- `CommentThread` — comment rendering  

These components:

- Fetch data directly on the server
- Ship minimal JavaScript to the client
- Re-render deterministically via `revalidatePath` after mutations

Rendering happens where the data lives.

---

### Client Components (Targeted Interaction)

- `NewIssueForm`
- `CommentComposer`
- `StatusToggle`

These components handle:

- Form input state
- Pending transitions
- Validation errors
- Small optimistic UX improvements

No persistent business data is stored in client state.

---

### Server State

Persistent state includes:

- Issues
- Comments
- Status transitions

Data is stored in a file-backed datastore:

```
/data/db.json
```

Access is isolated behind a repository layer:

```
src/lib/issuesRepo.ts
```

Mutations occur exclusively through Server Actions:

```
src/actions/issues.ts
```

The server remains the single source of truth.

---

### URL as View State

Filtering is implemented via search parameters:

```
/issues?status=OPEN&q=login
```

This provides:

- Shareable URLs
- Native browser navigation
- Server-rendered filtering
- No client-side filter state

---

## Revalidation Strategy

All mutations:

1. Update canonical server state  
2. Trigger `revalidatePath`  
3. Allow RSC to re-fetch and re-render  

No client-side cache synchronization is required.

---

## Project Structure

```
src/
  app/
    issues/
      page.tsx
      [id]/page.tsx
    new/page.tsx

  actions/
    issues.ts

  components/
    NewIssueForm.client.tsx
    CommentComposer.client.tsx
    StatusToggle.client.tsx
    CommentThread.tsx

  lib/
    db.ts
    issuesRepo.ts

data/
  db.json
```

---

## Running Locally

```bash
pnpm install
pnpm seed
pnpm dev
```

Visit:

```
http://localhost:3000/issues
```

---

## Tradeoffs

- File-based persistence (not suitable for concurrent production workloads)
- No authentication layer
- No transactional guarantees

The datastore is intentionally simple to keep the focus on rendering boundaries and data ownership patterns.

---

## Principles Demonstrated

- Default to server-rendered data
- Minimize client JavaScript
- Keep mutation logic on the server
- Treat the server as the source of truth
- Use URL state instead of local state where appropriate
- Keep client state ephemeral and interaction-focused

This project is intentionally small but reflects production-oriented patterns for building scalable, server-first React applications using the App Router.
---

## Testing

The project uses Vitest for unit and integration testing.

### Running Tests

```bash
# Run tests once
pnpm test

# Run tests in watch mode
pnpm test:watch
```

### Test Coverage

Tests are organized alongside the code they test:

- `src/lib/__tests__/issuesRepo.test.ts` — Repository layer tests
- `src/actions/__tests__/issues.test.ts` — Server action validation tests

The test suite covers:

- CRUD operations for issues and comments
- Filtering and search functionality
- Status transitions
- Input validation and error handling
- Edge cases (non-existent resources, empty states)

### Test Database

Tests use a separate database file (`data/db.test.json`) that is automatically created and cleaned up between test runs. This ensures tests are isolated and don't affect development data.
