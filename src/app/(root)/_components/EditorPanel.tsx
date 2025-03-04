"use client";

import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { useEffect, useRef, useState } from "react";
import { defineMonacoThemes, LANGUAGE_CONFIG } from "../_constants";
import { Editor, Monaco } from "@monaco-editor/react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { RotateCcwIcon, TypeIcon, LightbulbIcon, Lightbulb, CopyIcon, ExternalLinkIcon } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import useMounted from "@/hooks/useMounted";
import toast from "react-hot-toast";



// HintModal Component
function HintModal({ hints, onClose }: { hints: string[]; onClose: () => void }) {
  const safeHints = Array.isArray(hints) ? hints : [];
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 backdrop-blur-sm"
      >
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="bg-[#1e1e2e] p-6 rounded-xl w-full max-w-md relative border border-white/10 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="p-2 rounded-lg bg-[#2a2a3a]"
            >
              <Lightbulb className="w-6 h-6 text-yellow-400" />
            </motion.div>
            <h2 className="text-xl font-semibold text-white">Hints</h2>
          </div>
          <ul className="space-y-3">
            {safeHints.map((hint, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className="flex items-start gap-3 p-3 bg-[#2a2a3a] rounded-lg border border-white/10"
              >
                <span className="text-lg text-gray-200">{hint}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function EditorPanel() {
  const clerk = useClerk();
  const {
    language,
    theme,
    fontSize,
    editor,
    setFontSize,
    setEditor,
    problem,
    analyzeCode,
    hints,
  } = useCodeEditorStore();
  const editorRef = useRef<Monaco | null >(null);
  const mounted = useMounted();
  const [showHintsModal, setShowHintsModal] = useState(false);

  console.log(editor); 

  const handleEditorMount = (editorInstance: any) => {
    editorRef.current = editorInstance;
    setEditor(editorInstance);
  };

  useEffect(() => {
    if (editorRef.current && problem?.starterCode?.[language]) {
      editorRef.current.setValue(problem.starterCode[language]);
    } else if (editorRef.current) {
      const defaultCode = LANGUAGE_CONFIG[language].defaultCode || "";
      editorRef.current.setValue(defaultCode);
    }
  }, [language, problem]);

  useEffect(() => {
    const savedFontSize = localStorage.getItem("editor-font-size");
    if (savedFontSize) setFontSize(parseInt(savedFontSize));
  }, [setFontSize]);

  const handleRefresh = () => {
    const defaultCode = LANGUAGE_CONFIG[language].defaultCode;
    if (editorRef.current) editorRef.current.setValue(defaultCode);
    localStorage.removeItem(`editor-code-${language}`);
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value) localStorage.setItem(`editor-code-${language}`, value);
  };

  const handleFontSizeChange = (newSize: number) => {
    const size = Math.min(Math.max(newSize, 12), 24);
    setFontSize(size);
    localStorage.setItem("editor-font-size", size.toString());
  };

  const handleAnalyzeCode = async () => {
    await analyzeCode();
    setShowHintsModal(true);
  };

  // Copy Code to Clipboard
  const handleCopyCode = () => {
    if (editorRef.current) {
      const code = editorRef.current.getValue();
      navigator.clipboard
        .writeText(code)
        .then(() => {
          toast.success("Code copied to clipboard!", {
            icon: "📋", // Custom icon
            style: {
              background: "#2a2a3a", // Slightly lighter background for the toast
              color: "#fff",
              border: "1px solid #ffffff10",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
            },
          });
        })
        .catch(() => {
          toast.error("Failed to copy code.", {
            icon: "❌", // Custom icon for errors
            style: {
              background: "#ff4444", // Red background for errors
              color: "#fff",
              border: "1px solid #ffffff10",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
            },
          });
        });
    }
  }

  // Open LeetCode Problem
  const handleOpenLeetCode = () => {
    if (problem?.url) {
      window.open(problem.url, "_blank");
    }
  };

  if (!mounted) return null;

  return (
    <div className="relative">
      <div className="relative bg-[#12121a]/90 backdrop-blur rounded-xl border border-white/[0.05] p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1e1e2e] ring-1 ring-white/5">
              <Image src={"/" + language + ".png"} alt="Logo" width={24} height={24} />
            </div>
            <div>
              <h2 className="text-sm font-medium text-white">Code Editor</h2>
              <p className="text-xs text-gray-500">Write and execute your code</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Font Size Slider */}
            <div className="flex items-center gap-3 px-3 py-2 bg-[#1e1e2e] rounded-lg ring-1 ring-white/5">
              <TypeIcon className="size-4 text-gray-400" />
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={fontSize}
                  onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
                  className="w-20 h-1 bg-gray-600 rounded-lg cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-400 min-w-[2rem] text-center">
                  {fontSize}
                </span>
              </div>
            </div>

            {/* Copy Code Button */}
            <motion.button
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.95 }}
  onClick={handleCopyCode}
  className="p-2 bg-[#1e1e2e] hover:bg-[#2a2a3a] rounded-lg ring-1 ring-white/5 transition-colors"
  aria-label="Copy code"
>
  <CopyIcon className="size-5 text-gray-400" />
</motion.button>

            {/* LeetCode Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpenLeetCode}
              className="p-2 bg-[#1e1e2e] hover:bg-[#2a2a3a] rounded-lg ring-1 ring-white/5 transition-colors"
              aria-label="Open in LeetCode"
            >
              <ExternalLinkIcon className="size-5 text-gray-400" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="p-2 bg-[#1e1e2e] hover:bg-[#2a2a3a] rounded-lg ring-1 ring-white/5 transition-colors"
              aria-label="Reset to default code"
            >
              <RotateCcwIcon className="size-5 text-gray-400" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAnalyzeCode}
              className="p-2 bg-[#1e1e2e] hover:bg-[#2a2a3a] rounded-lg ring-1 ring-white/5 transition-colors"
              aria-label="Analyze code"
            >
              <LightbulbIcon className="size-5 text-yellow-400" />
            </motion.button>
          </div>
        </div>

        {/* Editor */}
        <div className="relative group rounded-xl overflow-hidden ring-1 ring-white/[0.05]">
          {clerk.loaded && (
            <Editor
              height="600px"
              language={LANGUAGE_CONFIG[language].monacoLanguage}
              onChange={handleEditorChange}
              theme={theme}
              beforeMount={defineMonacoThemes}
              onMount={handleEditorMount}
              options={{
                minimap: { enabled: false },
                fontSize,
                automaticLayout: true,
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                renderWhitespace: "selection",
                fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
                fontLigatures: true,
                cursorBlinking: "smooth",
                smoothScrolling: true,
                contextmenu: true,
                renderLineHighlight: "all",
                lineHeight: 1.6,
                letterSpacing: 0.5,
                roundedSelection: true,
                scrollbar: {
                  verticalScrollbarSize: 8,
                  horizontalScrollbarSize: 8,
                },
              }}
            />
          )}
        </div>
      </div>

      {/* Hints Modal */}
      {showHintsModal && (
        <HintModal
          hints={hints}
          onClose={() => setShowHintsModal(false)}
        />
      )}
    </div>
  );
}

export default EditorPanel;