import React, { createContext, useContext, useState } from "react";

interface BuilderNavContextType {
  navOpen: boolean;
  setNavOpen: (open: boolean) => void;
  previewMode: boolean;
  setPreviewMode: (mode: boolean) => void;
}

const BuilderNavContext = createContext<BuilderNavContextType>({
  navOpen: true,
  setNavOpen: () => {},
  previewMode: false,
  setPreviewMode: () => {},
});

export function BuilderNavProvider({ children }: { children: React.ReactNode }) {
  const [navOpen, setNavOpen] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);

  return (
    <BuilderNavContext.Provider value={{ navOpen, setNavOpen, previewMode, setPreviewMode }}>
      {children}
    </BuilderNavContext.Provider>
  );
}

export function useBuilderNav() {
  return useContext(BuilderNavContext);
}
