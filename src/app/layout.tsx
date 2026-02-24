import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Got Issues",
  description: "RSC + Server Actions + Server State demo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <nav className="nav">
            <Link href="/issues">Issues</Link>
            <Link href="/new">New issue</Link>
            <span style={{ marginLeft: "auto" }} className="subtle">
              Got Issues
            </span>
          </nav>

          {children}
        </div>
      </body>
    </html>
  );
}
