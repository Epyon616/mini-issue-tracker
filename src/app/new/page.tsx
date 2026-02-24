import NewIssueForm from "@/components/NewIssueForm.client";

export default function NewIssuePage() {
  return (
    <main className="stack" style={{ marginTop: 18 }}>
      <header className="header">
        <div>
          <h1 className="h1">New issue</h1>
          <div className="subtle">Client form → server action → redirect</div>
        </div>
      </header>

      <section className="panel">
        <NewIssueForm />
      </section>
    </main>
  );
}