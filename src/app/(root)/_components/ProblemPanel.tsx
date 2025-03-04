"use client";

import { useEffect } from "react";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";

function ProblemPanel() {
  const { problem, isFetchingProblem, error, fetchProblem } = useCodeEditorStore();

  useEffect(() => {
    if (!problem) {
      fetchProblem(1); // Default problem number (can be dynamic)
    }
  }, [fetchProblem, problem]);

  return (
    <motion.div
      className="bg-[#1e1e2e] rounded-xl p-6 ring-1 ring-gray-800/50 h-[50vh]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <SimpleBar className="h-full">
        {/* Loading Skeleton */}
        {isFetchingProblem && !error && (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Title Skeleton */}
            <div className="h-6 bg-[#2a2a3a] rounded-lg w-3/4 animate-pulse" />

            {/* Difficulty Skeleton */}
            <div className="h-4 bg-[#2a2a3a] rounded-lg w-1/4 animate-pulse" />

            {/* Problem Description Skeleton */}
            <div className="space-y-2">
              <div className="h-4 bg-[#2a2a3a] rounded-lg w-full animate-pulse" />
              <div className="h-4 bg-[#2a2a3a] rounded-lg w-5/6 animate-pulse" />
              <div className="h-4 bg-[#2a2a3a] rounded-lg w-4/6 animate-pulse" />
              <div className="h-4 bg-[#2a2a3a] rounded-lg w-3/4 animate-pulse" />
            </div>

            {/* LeetCode Link Skeleton */}
            <div className="h-4 bg-[#2a2a3a] rounded-lg w-1/3 animate-pulse" />
          </motion.div>
        )}

        {/* Problem Details */}
        {!isFetchingProblem && problem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Title & Difficulty */}
            <div className="mb-4">
              <h3 className="text-2xl font-semibold text-gray-200">{problem.title}</h3>
              <p
                className={`text-base font-semibold ${
                  problem.difficulty === "Easy"
                    ? "text-green-400"
                    : problem.difficulty === "Medium"
                    ? "text-yellow-400"
                    : "text-red-400"
                }`}
              >
                {problem.difficulty}
              </p>
            </div>

            {/* Problem Description */}
            <div
              className="text-gray-300 text-xl space-y-3 leading-relaxed problem-description"
              dangerouslySetInnerHTML={{
                __html: problem.problemStatement || "<p>Problem description not available.</p>",
              }}
            />

            {/* LeetCode Link */}
            <motion.a
              href={problem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ExternalLink className="w-4 h-4" />
              <span>View on LeetCode</span>
            </motion.a>
          </motion.div>
        )}

        {/* Empty State */}
        {!isFetchingProblem && !problem && !error && (
          <motion.p
            className="text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Enter a problem number to fetch the details.
          </motion.p>
        )}
      </SimpleBar>
    </motion.div>
  );
}

export default ProblemPanel;