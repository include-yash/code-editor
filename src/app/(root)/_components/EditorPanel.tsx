"use client";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { useEffect, useRef } from "react";
import { defineMonacoThemes, LANGUAGE_CONFIG } from "../_constants";
import { Editor } from "@monaco-editor/react";
import { motion } from "framer-motion";
import Image from "next/image";
import { RotateCcwIcon, TypeIcon } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import useMounted from "@/hooks/useMounted";

function EditorPanel() {
  const clerk = useClerk();
  const { language, theme, fontSize, editor, setFontSize, setEditor, problem } = useCodeEditorStore();
  const editorRef = useRef<any>(null); // Ref to store the editor instance
  const mounted = useMounted();

  // Handle editor mount
  const handleEditorMount = (editorInstance: any) => {
    editorRef.current = editorInstance;
    setEditor(editorInstance);
  };

  // Watch for language changes and update the editor
  useEffect(() => {
    if (editorRef.current && problem?.starterCode?.[language]) {
      // Update the editor with the correct starter code
      editorRef.current.setValue(problem.starterCode[language]);
    } else if (editorRef.current) {
      // Fallback to default code if starter code is not available
      const defaultCode = LANGUAGE_CONFIG[language].defaultCode || "";
      editorRef.current.setValue(defaultCode);
    }
  }, [language, problem]);

  // Handle font size changes
  useEffect(() => {
    const savedFontSize = localStorage.getItem("editor-font-size");
    if (savedFontSize) setFontSize(parseInt(savedFontSize));
  }, [setFontSize]);

  // Handle refresh button click
  const handleRefresh = () => {
    const defaultCode = LANGUAGE_CONFIG[language].defaultCode;
    if (editorRef.current) editorRef.current.setValue(defaultCode);
    localStorage.removeItem(`editor-code-${language}`);
  };

  // Handle editor content changes
  const handleEditorChange = (value: string | undefined) => {
    if (value) localStorage.setItem(`editor-code-${language}`, value);
  };

  // Handle font size slider changes
  const handleFontSizeChange = (newSize: number) => {
    const size = Math.min(Math.max(newSize, 12), 24);
    setFontSize(size);
    localStorage.setItem("editor-font-size", size.toString());
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

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="p-2 bg-[#1e1e2e] hover:bg-[#2a2a3a] rounded-lg ring-1 ring-white/5 transition-colors"
              aria-label="Reset to default code"
            >
              <RotateCcwIcon className="size-4 text-gray-400" />
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
              onMount={handleEditorMount} // Use the handleEditorMount function
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
    </div>
  );
}

export default EditorPanel;