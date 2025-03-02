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

  return (
    <motion.div
      className="flex w-full max-w-md items-center gap-3 bg-neutral-900 p-2 px-4 rounded-xl shadow-md border border-neutral-800"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <motion.input
        type="text"
        placeholder="Enter problem number..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="flex-1 px-2 py-2 text-sm md:text-base rounded-lg bg-neutral-800 text-white outline-none placeholder-gray-400 transition-all focus:ring-2 focus:ring-blue-500"
        whileFocus={{ scale: 1.02 }}
      />
      <motion.button
        onClick={handleGoClick}
        className="p-2 md:p-3 text-white bg-blue-600 rounded-lg transition-all shadow-sm hover:bg-blue-500 active:scale-95 disabled:opacity-50"
        disabled={isFetchingProblem} // Disable while fetching
      >
        {isFetchingProblem ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.6, ease: "linear" }}
          >
            <Loader2 size={18} className="animate-spin" />
          </motion.div>
        ) : (
          <ArrowUp size={18} />
        )}
      </motion.button>

      {error && <p className="text-red-400">{error}</p>}
    </motion.div>
  );
}
