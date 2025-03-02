import { create } from "zustand";

interface LeetCodeProblem {
  title: string;
  description: string;
  problemNumber: number;
}

interface LeetCodeState {
  problem: LeetCodeProblem | null;
  isLoading: boolean;
  error: string | null;
  fetchProblem: (problemNumber: number) => Promise<void>;
}

export const useLeetCodeStore = create<LeetCodeState>((set) => ({
  problem: null,
  isLoading: false,
  error: null,

  fetchProblem: async (problemNumber: number) => {
    if (isNaN(problemNumber)) {
      set({ error: "Invalid problem number", problem: null });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const response = await fetch(`/api/leetcode?problemNumber=${problemNumber}`);
      if (!response.ok) throw new Error("Failed to fetch problem details");

      const data = await response.json();
      set({ problem: data, error: null });
    } catch (error) {
      console.error("Error fetching problem:", error);
      set({ error: "Error fetching problem details", problem: null });
    } finally {
      set({ isLoading: false });
    }
  },
}));
