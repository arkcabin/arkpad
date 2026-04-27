import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BubbleMenu as BubbleMenuExtension, ArkpadEditorAPI } from '@arkpad/core';

export interface BubbleMenuProps {
  editor: ArkpadEditorAPI | null;
  children: React.ReactNode;
  className?: string;
  shouldShow?: (props: any) => boolean;
}

export const BubbleMenu: React.FC<BubbleMenuProps> = ({ 
  editor, 
  children, 
  className = '',
  shouldShow
}) => {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editor) return;

    // We need the element to be in the DOM before registering
    // but with Portal, it will be.
    const element = containerRef.current;
    if (!element) return;

    const extension = BubbleMenuExtension({
      editor,
      element,
      shouldShow,
    });

    editor.registerExtension(extension);
    setMounted(true);

    return () => {
      // Cleanup
    };
  }, [editor]);

  // Use a portal to render at the document body to avoid CSS transform issues
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div 
      ref={containerRef} 
      className={className}
      style={{ 
        position: 'fixed', 
        visibility: 'hidden', 
        zIndex: 1000,
        pointerEvents: 'auto',
        display: 'none'
      }}
    >
      {children}
    </div>,
    document.body
  );
};
