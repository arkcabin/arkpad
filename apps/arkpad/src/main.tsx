import React, { useState } from "react";
import ReactDOM from "react-dom/client";

import { App } from "./App";
import { BoldDemo } from "./BoldDemo";
import "./styles.css";

function Root() {
  const [view, setView] = useState<"main" | "bold">("main");

  if (view === "bold") {
    return <BoldDemo onBack={() => setView("main")} />;
  }

  return (
    <>
      <div className="fixed top-4 right-4 z-[100]">
        <button 
          onClick={() => setView("bold")}
          className="bg-brand text-white px-4 py-2 rounded-full shadow-lg font-bold hover:scale-105 transition-transform text-sm"
        >
          View Bold Only Demo
        </button>
      </div>
      <App />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
