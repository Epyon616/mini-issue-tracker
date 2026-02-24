import { createIssue, addComment, setIssueStatus } from "../src/lib/issuesRepo";

async function main() {
  const a = await createIssue({
    title: "Login button does nothing on Safari",
    body: "Users report clicking “Log in” doesn’t trigger the auth flow on Safari 17.",
  });

  await addComment(a.id, "I can reproduce on Safari 17.3.");
  await addComment(a.id, "Likely related to a form submit handler.");

  const b = await createIssue({
    title: "Close issue action sometimes shows stale status",
    body: "After closing an issue, detail updates but list page looks stale until refresh.",
  });

  await setIssueStatus(b.id, "CLOSED");

  console.log("Seeded ✅");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
