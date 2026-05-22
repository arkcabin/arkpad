import React from "react";
import { Link, useLocation } from "react-router-dom";

export function ShellLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link className={`nav-link ${active ? "active" : ""}`} to={to}>
      {children}
    </Link>
  );
}
