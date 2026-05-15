import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-20">
      <h1 className="text-4xl font-bold mb-4 tracking-tight">Arkpad</h1>
      <p className="text-lg text-fd-muted-foreground mb-8 max-w-lg text-center">
        A high-performance, modular rich text editor framework built on ProseMirror.
      </p>
      <div className="flex gap-4">
        <Link
          href="/docs"
          className="inline-flex items-center rounded-full bg-fd-primary text-fd-primary-foreground px-6 py-2.5 text-sm font-medium transition-colors hover:opacity-90"
        >
          Get Started
        </Link>
        <Link
          href="https://github.com/arkcabin/arkpad"
          className="inline-flex items-center rounded-full border border-fd-border px-6 py-2.5 text-sm font-medium transition-colors hover:bg-fd-accent"
        >
          GitHub
        </Link>
      </div>
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl w-full">
        <div className="rounded-xl border border-fd-border p-6">
          <h3 className="font-semibold mb-2">Modular</h3>
          <p className="text-sm text-fd-muted-foreground">
            Tiny core with a powerful extension system. Use only what you need.
          </p>
        </div>
        <div className="rounded-xl border border-fd-border p-6">
          <h3 className="font-semibold mb-2">Headless</h3>
          <p className="text-sm text-fd-muted-foreground">
            Complete UI freedom. Bring your own components and styling.
          </p>
        </div>
        <div className="rounded-xl border border-fd-border p-6">
          <h3 className="font-semibold mb-2">Agent-Ready</h3>
          <p className="text-sm text-fd-muted-foreground">
            Built-in interceptor layer for AI integration and validation.
          </p>
        </div>
      </div>
    </div>
  );
}
