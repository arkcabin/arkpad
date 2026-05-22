import { TopNav } from "../components/navigation/TopNav";

export function HomePage() {
  return (
    <main className="page-shell">
      <div className="page-frame simple-frame">
        <header className="topbar">
          <p className="eyebrow">Arkpad App</p>
          <h1>Simple home</h1>
          <TopNav />
        </header>

        <p className="lede">A plain home page, full-page editor, and builder workspace.</p>
      </div>
    </main>
  );
}
