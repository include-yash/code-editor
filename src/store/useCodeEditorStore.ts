import { CodeEditorState } from "./../types/index";
import { LANGUAGE_CONFIG } from "@/app/(root)/_constants";
import { create } from "zustand";
import { Monaco } from "@monaco-editor/react";

interface LeetCodeProblem {
  title: string;
  difficulty: string;
  url: string;
  problemStatement?: string;
  hints?: string[];
}

const HINT_UNLOCK_INTERVAL = 10 * 1000;

const getInitialState = () => {
  if (typeof window === "undefined") {
    return {
      language: "javascript",
      fontSize: 16,
      theme: "vs-dark",
    };
  }

  return {
    language: localStorage.getItem("editor-language") || "javascript",
    theme: localStorage.getItem("editor-theme") || "vs-dark",
    fontSize: Number(localStorage.getItem("editor-font-size") || 16),
  };
};

export const useCodeEditorStore = create<CodeEditorState & {
  problem: LeetCodeProblem | null;
  isFetchingProblem: boolean;
  unlockedHints: number;
  lastUnlockTime: number | null;
  isHintButtonActive: boolean;
  hintUnlockProgress: number;
  fetchProblem: (problemNumber: number) => Promise<void>;
  resetHints: () => void;
  incrementHintUnlock: () => void;
  updateHintProgress: () => void;
  runCode: () => Promise<void>;
}>((set, get) => ({
  ...getInitialState(),
  output: "",
  isRunning: false,
  error: null,
  editor: null,
  executionResult: null,
  problem: null,
  isFetchingProblem: false,
  unlockedHints: 0,
  lastUnlockTime: null,
  isHintButtonActive: false,
  hintUnlockProgress: 0,

  getCode: () => get().editor?.getValue() || "",

  setEditor: (editor: Monaco) => {
    const savedCode = localStorage.getItem(`editor-code-${get().language}`);
    if (savedCode) editor.setValue(savedCode);
    set({ editor });
  },

  setTheme: (theme: string) => {
    localStorage.setItem("editor-theme", theme);
    set({ theme });
  },

  setFontSize: (fontSize: number) => {
    localStorage.setItem("editor-font-size", fontSize.toString());
    set({ fontSize });
  },

  setLanguage: (language: string) => {
    const currentCode = get().editor?.getValue();
    if (currentCode) {
      localStorage.setItem(`editor-code-${get().language}`, currentCode);
    }
    localStorage.setItem("editor-language", language);
    set({ language, output: "", error: null });
  },

  fetchProblem: async (problemNumber: number) => {
    set({ 
      isFetchingProblem: true, 
      error: null, 
      unlockedHints: 0, 
      lastUnlockTime: Date.now(), 
      isHintButtonActive: false 
    });

    try {
      const response = await fetch(`/api/leetcode/${problemNumber}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      set({
        problem: {
          title: data.title,
          difficulty: data.difficulty,
          url: data.url,
          problemStatement: data.problemStatement,
          hints: data.hints || [],
        },
        isFetchingProblem: false,
        unlockedHints: 1,
        lastUnlockTime: Date.now(),
        isHintButtonActive: true,
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : "Error fetching problem", 
        isFetchingProblem: false 
      });
    }
  },

  resetHints: () => {
    set({ 
      unlockedHints: 1, 
      lastUnlockTime: Date.now(), 
      isHintButtonActive: true, 
      hintUnlockProgress: 0 
    });
  },

  incrementHintUnlock: () => {
    set((state) => {
      const now = Date.now();
      if (state.unlockedHints < (state.problem?.hints?.length || 0) && 
          state.lastUnlockTime && 
          now - state.lastUnlockTime >= HINT_UNLOCK_INTERVAL) {
        return {
          unlockedHints: state.unlockedHints + 1,
          lastUnlockTime: now,
          isHintButtonActive: true,
          hintUnlockProgress: 0,
        };
      }
      return state;
    });
  },

  updateHintProgress: () => {
    const { lastUnlockTime } = get();
    if (!lastUnlockTime) return;

    const now = Date.now();
    const elapsed = now - lastUnlockTime;
    const progress = Math.min((elapsed / HINT_UNLOCK_INTERVAL) * 100, 100);
    set({ hintUnlockProgress: progress });
  },

  runCode: async () => {
    const { language, getCode } = get();
    const code = getCode();

    if (!code.trim()) {
      set({ error: "Please enter some code before executing" });
      return;
    }

    set({ isRunning: true, error: null, output: "" });

    try {
      const runtime = LANGUAGE_CONFIG[language]?.pistonRuntime;
      if (!runtime) throw new Error(`Unsupported language: ${language}`);

      console.log("Executing code:", { language: runtime, code });
      
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: runtime.language,
          version: runtime.version,
          files: [{ content: code }],
        }),
      });

      const data = await response.json();
      console.log("Execution response:", data);

      if (!data || typeof data !== "object") {
        throw new Error("Invalid response from execution engine");
      }

      // Handle compilation errors
      if (data.compile && data.compile.code !== 0) {
        throw new Error(data.compile.stderr || data.compile.output || "Compilation failed");
      }

      // Handle runtime errors
      if (!data.run || typeof data.run !== "object") {
        throw new Error("Execution failed - no runtime data received");
      }

      const { output = "", stderr = "", code: exitCode = 1 } = data.run;
      const cleanOutput = String(output).trim();
      const cleanError = String(stderr).trim();

      if (exitCode !== 0 || cleanError) {
        throw new Error(cleanError || cleanOutput || "Runtime error occurred");
      }

      set({
        output: cleanOutput || "No output",
        executionResult: { code, output: cleanOutput, error: null },
      });
    } catch (error) {
      console.error("Execution error:", error);
      set({
        error: error instanceof Error ? error.message : "Unknown execution error",
        output: "",
        executionResult: null,
      });
    } finally {
      set({ isRunning: false });
    }
  },
}));

export const getExecutionResult = () => useCodeEditorStore.getState().executionResult;