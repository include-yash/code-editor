"use client";

import { useEffect } from "react";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";

function ProblemPanel() {
  const { problem, isFetchingProblem, error, fetchProblem } = useCodeEditorStore();

  // Auto-fetch problem when component mounts (optional)
  useEffect(() => {
    if (!problem) {
      fetchProblem(1); // Default problem number (can be dynamic)
    }
  }, [fetchProblem, problem]);

  return (
    <div className="bg-[#181825] rounded-xl p-4 ring-1 ring-gray-800/50 h-[50vh] overflow-auto">
      <h2 className="text-xl font-semibold text-gray-300 mb-2">Problem Description</h2>

      {isFetchingProblem ? (
        <p className="text-gray-400">Loading problem...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : problem ? (
        <div>
          {/* Title & Difficulty */}
          <h3 className="text-lg font-medium text-gray-200">{problem.title}</h3>
          <p
            className={`text-sm font-semibold ${
              problem.difficulty === "Easy"
                ? "text-green-400"
                : problem.difficulty === "Medium"
                ? "text-yellow-400"
                : "text-red-400"
            }`}
          >
            {problem.difficulty}
          </p>

          {/* Render HTML problem description exactly like LeetCode */}
          <div
            className="mt-3 text-gray-300 text-sm space-y-3 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: problem.problemStatement || "<p>Problem description not available.</p>" }}
          />

          {/* LeetCode Link */}
          <a
            href={problem.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-3 text-blue-400 underline hover:text-blue-300"
          >
            View on LeetCode
          </a>
        </div>
      ) : (
        <p className="text-gray-400">Enter a problem number to fetch the details.</p>
      )}
    </div>
  );
}

export default ProblemPanel;
