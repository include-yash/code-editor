"use client"; // Mark as Client Component

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import EditorPanel from "./_components/EditorPanel";
import Header from "./_components/Header";
import OutputPanel from "./_components/OutputPanel";
import ProblemPanel from "./_components/ProblemPanel";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] to-[#1a1a2e]">
      <div className="max-w-[1800px] mx-auto p-4">
        <Header />
        <PanelGroup direction="horizontal" className="w-full h-[calc(100vh-80px)]">
          {/* Left Panel (EditorPanel) */}
          <Panel defaultSize={50} minSize={30} className="pr-1">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="h-full bg-[#1e1e2e] rounded-xl shadow-lg border border-white/10"
            >
              <EditorPanel />
            </motion.div>
          </Panel>

          {/* Resize Handle (Thinner) */}
          <PanelResizeHandle className="w-1 relative">
            <div className="absolute inset-0 bg-neutral-800 hover:bg-blue-500 transition-colors rounded-full" />
          </PanelResizeHandle>

          {/* Right Panel (ProblemPanel and OutputPanel) */}
          <Panel defaultSize={50} minSize={30} className="pl-1">
            <PanelGroup direction="vertical">
              {/* Top Panel (ProblemPanel) */}
              <Panel defaultSize={50} minSize={30} className="pb-1">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="h-full bg-[#1e1e2e] rounded-xl shadow-lg border border-white/10"
                >
                  <ProblemPanel />
                </motion.div>
              </Panel>

              {/* Resize Handle (Thinner) */}
              <PanelResizeHandle className="h-1 relative">
                <div className="absolute inset-0 bg-neutral-800 hover:bg-blue-500 transition-colors rounded-full" />
              </PanelResizeHandle>

              {/* Bottom Panel (OutputPanel) */}
              <Panel defaultSize={50} minSize={30} className="pt-1">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="h-full bg-[#1e1e2e] rounded-xl shadow-lg border border-white/10"
                >
                  <OutputPanel />
                </motion.div>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}