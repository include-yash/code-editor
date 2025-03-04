"use client";

import { motion } from "framer-motion";

interface HintModalProps {
  hints: string[];
  onClose: () => void;
}

export default function HintModal({ hints, onClose }: HintModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-[#1e1e2e] p-6 rounded-lg w-full max-w-md"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Hints</h2>
        <ul className="list-disc list-inside text-sm text-gray-400">
          {hints.map((hint, index) => (
            <li key={index} className="mb-2">
              {hint}
            </li>
          ))}
        </ul>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-[#2a2a3a] text-white rounded-lg hover:bg-[#3a3a4a] transition-colors"
        >
          Close
        </button>
      </motion.div>
    </div>
  );
}