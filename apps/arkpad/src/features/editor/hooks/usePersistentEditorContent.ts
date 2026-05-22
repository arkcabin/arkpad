import React from "react";
import { EDITOR_STORAGE_KEY, DEFAULT_EDITOR_CONTENT } from "../config/defaultContent";
import { getStorageItem, setStorageItem } from "../../../lib/storage";

function loadInitialContent() {
  return getStorageItem(EDITOR_STORAGE_KEY) || DEFAULT_EDITOR_CONTENT;
}

export function usePersistentEditorContent() {
  const [content, setContent] = React.useState(loadInitialContent);

  const persistContent = React.useCallback((html: string) => {
    setContent(html);
    setStorageItem(EDITOR_STORAGE_KEY, html);
  }, []);

  return { content, persistContent };
}
