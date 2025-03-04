/* eslint-disable */
import { NextResponse } from "next/server";

interface LeetCodeProblem {
  stat: {
    frontend_question_id: number;
    question__title: string;
    question__title_slug: string;
  };
  difficulty: {
    level: number;
  };
}

export async function GET(request: Request) {
  try {
    // ✅ Extract problem number safely from request URL
    const url = new URL(request.url);
    const problemNumber = parseInt(url.pathname.split("/").pop() || "", 10);

    if (isNaN(problemNumber)) {
      return NextResponse.json({ error: "Invalid problem number" }, { status: 400 });
    }

    // ✅ Fetch list of problems from LeetCode API
    const response = await fetch("https://leetcode.com/api/problems/all/", {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch problem list" }, { status: 500 });
    }

    const data = await response.json();

    const problem = data.stat_status_pairs.find(
      (p: LeetCodeProblem) => p.stat.frontend_question_id === problemNumber
    );

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    const problemSlug = problem.stat.question__title_slug;
    const problemUrl = `https://leetcode.com/problems/${problemSlug}/`;

    // ✅ Fetch full problem details and code snippets
    const problemResponse = await fetch(`https://leetcode.com/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0",
      },
      body: JSON.stringify({
        query: `
          query getQuestionDetail($titleSlug: String!) {
            question(titleSlug: $titleSlug) {
              content
              codeSnippets {
                lang
                langSlug
                code
              }
            }
          }
        `,
        variables: { titleSlug: problemSlug },
      }),
    });

    if (!problemResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch problem details" }, { status: 500 });
    }

    const problemData = await problemResponse.json();
    const problemStatement = problemData.data.question.content || "Problem description not available.";

    // ✅ Extract code snippets
    const codeSnippets = problemData.data.question.codeSnippets || [];
    const starterCode: { [key: string]: string } = {};

    // Map code snippets to supported languages
    codeSnippets.forEach((snippet: { langSlug: string; code: string }) => {
      switch (snippet.langSlug) {
        case "javascript":
          starterCode.javascript = snippet.code;
          break;
        case "python":
          starterCode.python = snippet.code;
          break;
        case "java":
          starterCode.java = snippet.code;
          break;
        case "cpp":
          starterCode.cpp = snippet.code;
          break;
        case "csharp":
          starterCode.csharp = snippet.code;
          break;
        case "ruby":
          starterCode.ruby = snippet.code;
          break;
        case "swift":
          starterCode.swift = snippet.code;
          break;
        case "go":
          starterCode.go = snippet.code;
          break;
        case "rust":
          starterCode.rust = snippet.code;
          break;
        // Add more languages as needed
      }
    });

    return NextResponse.json({
      title: problem.stat.question__title,
      difficulty:
        problem.difficulty.level === 1 ? "Easy" : problem.difficulty.level === 2 ? "Medium" : "Hard",
      url: problemUrl,
      problemStatement, // ✅ Full problem description in HTML format
      starterCode, // ✅ Starter code for supported languages
    });
  } catch (error) {
    console.error("Error fetching problem:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}