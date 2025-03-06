/* eslint-disable */
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Loader2, Hash } from "lucide-react";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import toast from "react-hot-toast";

export default function InputField() {
  const [inputValue, setInputValue] = useState("");
  const [isInputVisible, setIsInputVisible] = useState(false);
  const { fetchProblem, isFetchingProblem } = useCodeEditorStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleGoClick = () => {
    const problemNumber = parseInt(inputValue.trim(), 10);
    if (isNaN(problemNumber)) {
      toast.error("Invalid input: Please enter a valid problem number.", {
        style: {
          background: "#1e1e2e",
          color: "#fff",
          border: "1px solid #3b82f6",
        },
      });
      return;
    }
    fetchProblem(problemNumber);
  };

  // Handle Enter key press
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleGoClick();
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsInputVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus input when it becomes visible
  useEffect(() => {
    if (isInputVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isInputVisible]);

  return (
    <motion.div
      ref={containerRef}
      className="flex items-center gap-2 bg-neutral-900 p-2 rounded-xl shadow-lg border border-neutral-800"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Toggle between Button and Input */}
      <AnimatePresence mode="wait">
        {!isInputVisible ? (
          <motion.button
          key="button"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          onClick={() => setIsInputVisible(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-300 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-all focus:outline-none"
        >
          <Hash className="w-4 h-4 text-blue-500" />
          <span>Problem No</span>
        </motion.button>
        ) : (
          <motion.div
            key="input"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
          >
            {/* Input field */}
            <motion.input
              ref={inputRef}
              type="text"
              placeholder="Problem #"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-20 px-3 py-1.5 text-sm rounded-lg bg-neutral-800 text-white outline-none placeholder-gray-400 transition-all focus:ring-2 focus:ring-blue-500 focus:bg-neutral-750"
              whileFocus={{ scale: 1.02 }}
              maxLength={4} // Limit input to 4 digits
            />

            {/* Go button with loading animation */}
            <motion.button
              onClick={handleGoClick}
              className="p-2 text-white bg-blue-600 rounded-lg transition-all shadow-md hover:bg-blue-500 active:scale-95 disabled:opacity-50 focus:outline-none"
              disabled={isFetchingProblem}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isFetchingProblem ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.6, ease: "linear" }}
                >
                  <Loader2 size={16} className="animate-spin" />
                </motion.div>
              ) : (
                <ArrowUp size={16} />
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}