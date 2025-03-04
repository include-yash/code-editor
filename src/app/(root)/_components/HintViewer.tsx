/* eslint-disable */
"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";

const HINT_UNLOCK_INTERVAL = 10 * 1000;
const TOTAL_HINTS = 6;

export default function HintViewer() {
  const {
    problem,
    unlockedHints,
    lastUnlockTime,
    incrementHintUnlock,
    resetHints,
    hintUnlockProgress,
    updateHintProgress,
  } = useCodeEditorStore();
  const [hints, setHints] = useState<string[]>(["Loading hints..."]);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasViewedHint, setHasViewedHint] = useState(false);
  const [isLoadingHints, setIsLoadingHints] = useState(true);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (problem) {
      setIsLoadingHints(true);
      setHints(["Loading hints..."]);
      resetHints();
      setIsButtonDisabled(true);
      setTimeout(() => setIsButtonDisabled(false), HINT_UNLOCK_INTERVAL);

      fetch(`/api/hints/${problem.title}`)
        .then((res) => res.json())
        .then((data) => setHints([...(data.hints || ["No hints available."])]))
        .catch(() => setHints(["No hints available."]))
        .finally(() => setIsLoadingHints(false));
    }
  }, [problem, resetHints]);

  useEffect(() => {
    if (!problem) return;

    const interval = setInterval(() => {
      updateHintProgress();
      if (unlockedHints < TOTAL_HINTS && lastUnlockTime) {
        const now = Date.now();
        if (now - lastUnlockTime >= HINT_UNLOCK_INTERVAL) {
          incrementHintUnlock();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [unlockedHints, lastUnlockTime, incrementHintUnlock, updateHintProgress, problem]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsModalOpen(false);
      }
    }
    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isModalOpen]);

  useEffect(() => {
    setHasViewedHint(false);
  }, [unlockedHints]);

  const handleOpenHint = () => {
    if (!isLoadingHints) {
      setIsModalOpen(true);
      setHasViewedHint(true);
    }
  };

  return (
    <div>
      <motion.button
        onClick={handleOpenHint}
        className={`flex items-center gap-2 px-4 py-1.5 rounded-lg border transition-all duration-300 shadow-sm 
          ${
            isButtonDisabled
              ? "border-gray-500/40 bg-gray-700/50 text-gray-400 cursor-not-allowed"
              : hasViewedHint && currentHintIndex >= unlockedHints
              ? "border-gray-500/40 bg-gray-700/50 text-gray-400 cursor-not-allowed"
              : "border-amber-500/40 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 hover:shadow-md hover:scale-105 transition"
          }`}
        whileTap={{ scale: 0.95 }}
        disabled={isButtonDisabled || (hasViewedHint && currentHintIndex >= unlockedHints)}
      >
        <Sparkles className="w-4 h-4" />
        <span className="text-sm font-medium">Hint</span>
      </motion.button>

      <motion.div className="relative w-full h-px bg-gray-700 rounded-full overflow-hidden mt-2">
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-400 to-yellow-500"
          initial={{ width: "0%" }}
          animate={{ width: `${hintUnlockProgress}%` }}
          transition={{ duration: 0.5 }}
        />
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 flex items-start justify-center pt-16 bg-black/50 backdrop-blur-md z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              ref={modalRef}
              className="bg-[#1a1a2e]/95 p-6 rounded-2xl shadow-2xl w-[28rem] relative border border-gray-700 backdrop-blur-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={22} />
              </button>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" /> Hint {unlockedHints > 0 ? currentHintIndex + 1 : "-"}
              </h2>
              <motion.p
                className="text-gray-200 text-lg font-medium min-h-[40px] flex items-center justify-center"

                key={currentHintIndex}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {isLoadingHints ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : hints[currentHintIndex] || "No hints available."}
              </motion.p>

              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() => setCurrentHintIndex((prev) => Math.max(prev - 1, 0))}
                  className="p-2 rounded-lg bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition"
                  disabled={currentHintIndex === 0}
                >
                  <ChevronLeft size={22} />
                </button>

                <span className="text-sm text-gray-400">
                  {unlockedHints > 0 ? `${currentHintIndex + 1} / ${unlockedHints}` : "-"}
                </span>

                <button
                  onClick={() => setCurrentHintIndex((prev) => Math.min(prev + 1, unlockedHints))}
                  className="p-2 rounded-lg bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition"
                  disabled={currentHintIndex >= unlockedHints - 1}
                >
                  <ChevronRight size={22} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
