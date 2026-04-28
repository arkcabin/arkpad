import React, { createContext, useContext, ReactNode } from "react";
import type { ArkpadEditorAPI } from "@arkpad/core";

const ArkpadContext = createContext<ArkpadEditorAPI | null>(null);

/**
 * Provider component to make the editor instance available globally via context.
 */
export const ArkpadProvider: React.FC<{ editor: ArkpadEditorAPI | null; children: ReactNode }> = ({
  editor,
  children,
}) => {
  return <ArkpadContext.Provider value={editor}>{children}</ArkpadContext.Provider>;
};

/**
 * Hook to access the editor instance from anywhere inside the ArkpadProvider.
 */
export const useArkpadContext = () => {
  const context = useContext(ArkpadContext);
  if (context === null) {
    throw new Error("useArkpadContext must be used within an ArkpadProvider");
  }
  return context;
};
