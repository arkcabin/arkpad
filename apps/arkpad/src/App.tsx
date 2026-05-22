function App() {
  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">Arkpad React Starter</p>
        <h1>Hello, Arkpad.</h1>
        <p className="lede">
          A clean React setup is ready here. Use this workspace as the entry point for the
          Arkpad demo app.
        </p>

        <div className="action-row">
          <div className="action-pill">
            <span className="dot" />
            <span>Run: npm run dev:app</span>
          </div>
          <div className="action-pill muted">Workspace name: @arkpad/app</div>
        </div>
      </section>
    </main>
  );
}

export default App;