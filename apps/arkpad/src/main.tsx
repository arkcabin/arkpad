import React from "react";
import ReactDOM from "react-dom/client";

import { Router } from "./Router";
import "./styles.css";

// Apply theme immediately to prevent flash
const savedTheme = localStorage.getItem("arkpad-theme");
if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);
