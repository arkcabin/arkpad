/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from "react";

export type DeviceType = "desktop" | "tablet" | "mobile";

interface StudioContextType {
  device: DeviceType;
  setDevice: (device: DeviceType) => void;
  previewMode: boolean;
  setPreviewMode: (preview: boolean) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isPropertyPanelOpen: boolean;
  setPropertyPanelOpen: (open: boolean) => void;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export function useStudio() {
  const context = useContext(StudioContext);
  if (!context) throw new Error("useStudio must be used within StudioProvider");
  return context;
}

export function StudioProvider({ children }: { children: React.ReactNode }) {
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [previewMode, setPreviewMode] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isPropertyPanelOpen, setPropertyPanelOpen] = useState(false);

  return (
    <StudioContext.Provider
      value={{
        device,
        setDevice,
        previewMode,
        setPreviewMode,
        isSidebarOpen,
        setSidebarOpen,
        isPropertyPanelOpen,
        setPropertyPanelOpen,
      }}
    >
      {children}
    </StudioContext.Provider>
  );
}
