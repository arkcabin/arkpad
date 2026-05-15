"use client";

import React from "react";
import { Tabs, TabsContent } from "fumadocs-ui/components/tabs";
import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";

interface DemoViewerProps {
  children: React.ReactNode;
  code: string;
}

export function DemoViewer({ children, code }: DemoViewerProps) {
  return (
    <div className="rounded-xl border bg-fd-card my-6 overflow-hidden not-prose">
      <Tabs items={["Preview", "Code"]}>
        <TabsContent value="Preview" className="p-0">
          <div className="min-h-[200px] flex items-center justify-center p-4 md:p-8 bg-fd-dot-grid">
            <div className="w-full max-w-[700px] bg-fd-background border shadow-sm rounded-lg overflow-hidden">
              {children}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="Code" className="m-0">
          <div className="relative">
            <CodeBlock>
              <Pre className="max-h-[500px] overflow-auto m-0 rounded-none border-none">
                <code>{code}</code>
              </Pre>
            </CodeBlock>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
