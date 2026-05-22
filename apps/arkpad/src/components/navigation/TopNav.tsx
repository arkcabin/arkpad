import { ShellLink } from "./ShellLink";

export function TopNav() {
  return (
    <nav className="nav-row" aria-label="Primary">
      <ShellLink to="/">Home</ShellLink>
      <ShellLink to="/editor">Editor</ShellLink>
      <ShellLink to="/builder">Builder</ShellLink>
    </nav>
  );
}
