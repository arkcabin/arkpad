import React, { createContext, useContext, useState } from "react";

interface BuilderNavContextType {
  navOpen: boolean;
  setNavOpen: (open: boolean) => void;
}

const BuilderNavContext = createContext<BuilderNavContextType>({
  navOpen: true,
  setNavOpen: () => {},
});

export function BuilderNavProvider({ children }: { children: React.ReactNode }) {
  const [navOpen, setNavOpen] = useState(true);
  return (
    <BuilderNavContext.Provider value={{ navOpen, setNavOpen }}>
      {children}
    </BuilderNavContext.Provider>
  );
}

export function useBuilderNav() {
  return useContext(BuilderNavContext);
}
