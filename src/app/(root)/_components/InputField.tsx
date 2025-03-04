/* eslint-disable */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp, Loader2 } from "lucide-react";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";

export default function InputField() {
  const [inputValue, setInputValue] = useState("");
  const { fetchProblem, isFetchingProblem, error } = useCodeEditorStore();

  const handleGoClick = () => {
    const problemNumber = parseInt(inputValue.trim(), 10);
    if (isNaN(problemNumber)) {
      console.error("Invalid input: Please enter a valid problem number.");
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

  return (
    <motion.div
      className="flex w-full max-w-xs items-center gap-2 bg-neutral-900 p-2 rounded-xl shadow-lg border border-neutral-800"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Input field with focus animation */}
      <motion.input
        type="text"
        placeholder="Problem #"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown} // Add keydown event listener
        className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-neutral-800 text-white outline-none placeholder-gray-400 transition-all focus:ring-2 focus:ring-blue-500 focus:bg-neutral-750"
        whileFocus={{ scale: 1.02 }}
        maxLength={4} // Limit input to 4 digits
      />

      {/* Go button with loading animation */}
      <motion.button
        onClick={handleGoClick}
        className="p-2 text-white bg-blue-600 rounded-lg transition-all shadow-md hover:bg-blue-500 active:scale-95 disabled:opacity-50"
        disabled={isFetchingProblem} // Disable while fetching
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

      {/* Error message with fade-in animation */}
      
    </motion.div>
  );
}