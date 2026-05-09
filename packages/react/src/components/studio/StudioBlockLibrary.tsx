import React from "react";
import { useArkpadContext } from "../editor/context";
import { cn } from "../../utils/utils";

interface StudioBlockLibraryProps {
  className?: string;
}

const BLOCKS = [
  { id: 'section', name: 'Section', type: 'section', icon: 'M4 6h16M4 12h16M4 18h16', category: 'Layout' },
  { id: 'columns', name: 'Columns', type: 'columns', icon: 'M4 4h7v16H4V4zm9 0h7v16h-7V4z', category: 'Layout', attrs: { columns: 2 } },
  { id: 'heading', name: 'Heading', type: 'heading', icon: 'M4 4h16v4H4V4zm0 6h16v4H4v-4zm0 6h12v4H4v-4z', category: 'Typography', attrs: { level: 1 }, content: 'Heading Text' },
  { id: 'paragraph', name: 'Paragraph', type: 'paragraph', icon: 'M4 4h16v2H4V4zm0 5h16v2H4V9zm0 5h16v2H4v-2zm0 5h10v2H4v-2z', category: 'Typography', content: 'Add your text here...' },
  { id: 'button', name: 'Button', type: 'button', icon: 'M4 7h16v10H4V7z', category: 'Elements', attrs: { text: 'Click me' } },
  { id: 'image', name: 'Image', type: 'image', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h14a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', category: 'Media' },
];

export function StudioBlockLibrary({ className }: StudioBlockLibraryProps) {
  const editor = useArkpadContext();

  const handleDragStart = (e: React.DragEvent, item: any) => {
    const dragData = {
      type: item.type,
      attrs: item.attrs || {},
      content: item.content
    };
    
    if (item.type === 'section') {
      e.dataTransfer.setData("application/arkpad-type-section", "true");
    }
    
    e.dataTransfer.setData("application/arkpad-block", JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = "move";
    
    // Create a beautiful, centered ghost image
    const ghost = document.createElement('div');
    ghost.className = "fixed top-[-1000px] left-[-1000px] px-4 py-2 bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-sm shadow-2xl pointer-events-none flex items-center gap-2 border border-blue-400";
    ghost.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="${item.icon}"/></svg> ${item.name}`;
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, ghost.offsetWidth / 2, ghost.offsetHeight / 2);
    
    setTimeout(() => {
      if (document.body.contains(ghost)) {
        document.body.removeChild(ghost);
      }
    }, 0);
  };

  const handleManualClick = (item: any) => {
    if (!editor) return;
    
    if (item.type === 'section') {
      editor.commands.setSection();
    } else if (item.type === 'columns') {
      editor.commands.setColumns(item.attrs);
    } else {
      editor.chain().insertContent({ 
        type: item.type, 
        attrs: item.attrs, 
        content: item.content ? [{ type: 'text', text: item.content }] : undefined 
      }).run();
    }
  };

  const categories = Array.from(new Set(BLOCKS.map(b => b.category)));

  return (
    <div className={cn("flex flex-col h-full bg-white dark:bg-[#0A0A0A] border-r border-neutral-200 dark:border-neutral-900 select-none font-sans overflow-hidden", className)}>
      {/* Header - Centered & Clean */}
      <div className="h-14 px-5 flex items-center justify-center border-b border-neutral-100 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-900/50">
        <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.1em]">Elements Library</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-hide">
        {categories.map(category => (
          <div key={category} className="space-y-3">
            <h3 className="px-1 text-[9px] font-bold text-neutral-400 dark:text-neutral-600 uppercase tracking-widest">
              {category}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {BLOCKS.filter(b => b.category === category).map(item => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item)}
                  onClick={() => handleManualClick(item)}
                  className="group flex flex-col items-center justify-center aspect-square bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-100 dark:border-neutral-800 rounded-lg hover:border-blue-500/50 hover:bg-blue-50/30 dark:hover:bg-blue-500/5 cursor-grab active:cursor-grabbing transition-all duration-200"
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 group-hover:border-blue-500/30 group-hover:text-blue-500 transition-colors shadow-sm">
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d={item.icon} />
                    </svg>
                  </div>
                  <span className="mt-2 text-[10px] font-medium text-neutral-600 dark:text-neutral-400 group-hover:text-blue-500 transition-colors">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Tip footer */}
      <div className="p-4 border-t border-neutral-100 dark:border-neutral-900 bg-neutral-50/30 dark:bg-neutral-900/20">
        <p className="text-[9px] text-neutral-400 dark:text-neutral-600 text-center leading-relaxed">
          Drag & Drop or Click to insert elements into the canvas
        </p>
      </div>
    </div>
  );
}
