import { Navigate, Route, Routes } from "react-router-dom";
import { BuilderPage } from "../pages/BuilderPage";
import { EditorPage } from "../pages/EditorPage";
import { HomePage } from "../pages/HomePage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/editor" element={<EditorPage />} />
      <Route path="/builder" element={<BuilderPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
