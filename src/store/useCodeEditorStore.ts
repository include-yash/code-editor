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
  starterCode?: { [key: string]: string }; // Starter code for each language
}

const HINT_UNLOCK_INTERVAL = 10 * 1000;

const getInitialState = () => {
  if (typeof window === "undefined") {
    return {
      language: "javascript",
      fontSize: 16,
      theme: "vs-dark",
      hints: [],
    };
  }

  return {
    language: localStorage.getItem("editor-language") || "javascript",
    theme: localStorage.getItem("editor-theme") || "vs-dark",
    fontSize: Number(localStorage.getItem("editor-font-size") || 16),
    hints: [],
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
  analyzeCode: () => Promise<void>;
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
  hints: [],

  getCode: () => get().editor?.getValue() || "",

  setEditor: (editor: Monaco) => {
    const savedCode = localStorage.getItem(`editor-code-${get().language}`);
    if (savedCode) {
      editor.setValue(savedCode);
    } else {
      const { problem, language } = get();

      // Check if problem and starterCode are defined
      if (problem?.starterCode?.[language]) {
        editor.setValue(problem.starterCode[language]);
      } else {
        // Fallback to default code if starterCode is not available
        const defaultCode = LANGUAGE_CONFIG[language]?.defaultCode || "";
        editor.setValue(defaultCode);
      }
    }

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
    const { problem, editor } = get();

    // Save current code before switching languages
    const currentCode = editor?.getValue();
    if (currentCode) {
      localStorage.setItem(`editor-code-${get().language}`, currentCode);
    }

    // Set new language and update editor with starter code
    if (editor) {
      if (problem?.starterCode?.[language]) {
        editor.setValue(problem.starterCode[language]);
      } else {
        // Fallback to default code if starterCode is not available
        const defaultCode = LANGUAGE_CONFIG[language]?.defaultCode || "";
        editor.setValue(defaultCode);
      }
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
      isHintButtonActive: false,
    });

    try {
      const response = await fetch(`/api/leetcode/${problemNumber}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      const starterCode = data.starterCode || {};

      // Ensure starter code exists for all supported languages
      Object.keys(LANGUAGE_CONFIG).forEach((lang) => {
        if (!starterCode[lang]) {
          starterCode[lang] = LANGUAGE_CONFIG[lang].defaultCode;
        }
      });

      set({
        problem: {
          title: data.title,
          difficulty: data.difficulty,
          url: data.url,
          problemStatement: data.problemStatement,
          hints: data.hints || [],
          starterCode, // Include starter code for all languages
        },
        isFetchingProblem: false,
        unlockedHints: 1,
        lastUnlockTime: Date.now(),
        isHintButtonActive: true,
      });

      // Update editor with starter code for the current language
      const { language, editor } = get();
      if (editor && starterCode[language]) {
        editor.setValue(starterCode[language]);
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Error fetching problem",
        isFetchingProblem: false,
      });
    }
  },

  resetHints: () => {
    set({
      unlockedHints: 1,
      lastUnlockTime: Date.now(),
      isHintButtonActive: true,
      hintUnlockProgress: 0,
    });
  },

  incrementHintUnlock: () => {
    set((state) => {
      const now = Date.now();
      if (
        state.unlockedHints < (state.problem?.hints?.length || 0) &&
        state.lastUnlockTime &&
        now - state.lastUnlockTime >= HINT_UNLOCK_INTERVAL
      ) {
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
      if (!data || typeof data !== "object") {
        throw new Error("Invalid response from execution engine");
      }

      set({
        output: data.run?.output?.trim() || "No output",
        executionResult: { code, output: data.run?.output?.trim() || "No output", error: null },
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unknown execution error",
        output: "",
        executionResult: null,
      });
    } finally {
      set({ isRunning: false });
    }
  },

  analyzeCode: async () => {
  const { language, getCode, problem } = get();
  const code = getCode();

  if (!code.trim()) {
    set({ error: "Please enter some code before analyzing" });
    return;
  }

  set({ isRunning: true, error: null, output: "" });

  try {
    const response = await fetch("/api/executeTest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language,
        code,
        problemStatement: problem?.problemStatement,
      }),
    });

    const data = await response.json();
    console.log("Response from /api/executeTest:", data); // Debugging

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Failed to analyze code");
    }

    // Ensure hints is always an array
    const hints = Array.isArray(data.hints) ? data.hints : [];
    set({
      hints,
      isRunning: false,
    });
  } catch (error) {
    console.error("Error in analyzeCode:", error); // Debugging
    set({
      error: error instanceof Error ? error.message : "Unknown analysis error",
      output: "",
      hints: [], // Reset hints to an empty array on error
    });
  } finally {
    set({ isRunning: false });
  }
},
}));

export const getExecutionResult = () => useCodeEditorStore.getState().executionResult;