import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

console.log("🚀 Starting CodeRace Mass Ingestion Pipeline...");

// --- SETUP SUPABASE ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- SOURCE DEFINITIONS ---
const problemsDirectory = "../leetcode-problems/problems/";

// ==========================================
// 1. THE C++ PARSER (PRIMARY SOURCE OF TRUTH)
// ==========================================
const cppTypeMap = {
  int: "integer",
  "long long": "long",
  long: "long",
  "vector<int>": "integer[]",
  "vector<int>&": "integer[]",
  "vector<long long>": "long[]",
  "vector<long long>&": "long[]",
  "vector<vector<int>>": "integer[][]",
  "vector<vector<int>>&": "integer[][]",
  "vector<vector<long long>>": "long[][]",
  "vector<vector<long long>>&": "long[][]",
  string: "string",
  "string&": "string",
  "vector<string>": "string[]",
  "vector<string>&": "string[]",
  bool: "boolean",
  char: "character",
  "ListNode*": "linked_list",
  "TreeNode*": "binary_tree",
};

const extractFromCPP = (cppSnippet) => {
  let className = "Solution";
  const classMatch = cppSnippet.match(/class\s+([a-zA-Z0-9_]+)/);
  if (classMatch) {
    className = classMatch[1];
  }

  // 🔥 SAFEGUARD 1: Atomic comment stripping. Eliminates structural notes completely.
  const cleanSnippet = cppSnippet
    .replace(/\/\*[\s\S]*?\*\//g, "") // Strips block comments /* ... */
    .replace(/\/\/.*/g, ""); // Strips trailing inline comments // ...

  // 🔥 SAFEGUARD 2: Strict multi-word declaration signature matcher
  const match = cleanSnippet.match(/([\w<>&:]+)\s+(\w+)\s*\(([^)]*)\)\s*\{/);
  if (!match) return null;

  const functionName = match[2];
  const argsString = match[3];
  const parameters = [];

  if (argsString.trim() !== "") {
    const rawArgs = argsString.split(",").map((arg) => arg.trim());
    for (const arg of rawArgs) {
      const parts = arg.split(/\s+/);
      let name = parts.pop();
      let rawType = parts.join("").trim();

      // 🔥 SAFEGUARD 3: Pointer alignment re-balancer (Fixes "TreeNode *root" spacing anomaly)
      if (name.startsWith("*")) {
        name = name.slice(1);
        rawType += "*";
      }
      if (name.startsWith("&")) {
        name = name.slice(1);
        rawType += "&";
      }

      parameters.push({
        name: name,
        type: cppTypeMap[rawType] || rawType,
      });
    }
  }
  return { class_name: className, function_name: functionName, parameters };
};

// ==========================================
// 2. THE TYPESCRIPT PARSER (THE BACKUP)
// ==========================================
const tsTypeMap = {
  number: "integer",
  "number[]": "integer[]",
  "number[][]": "integer[][]",
  string: "string",
  "string[]": "string[]",
  "string[][]": "string[][]",
  boolean: "boolean",
  "boolean[]": "boolean[]",
  character: "character",
  "character[]": "character[]",
  "character[][]": "character[][]",
  "ListNode | null": "linked_list",
  "TreeNode | null": "binary_tree",
};

const extractFromTS = (tsSnippet) => {
  let className = "Solution";
  const classMatch = tsSnippet.match(/class\s+([a-zA-Z0-9_]+)/);
  if (classMatch) {
    className = classMatch[1];
  }

  const funcMatch = tsSnippet.match(/function\s+([a-zA-Z0-9_]+)\s*\(/);
  if (!funcMatch) return null;

  const functionName = funcMatch[1];
  const argsMatch = tsSnippet.match(/\(([^)]+)\)/);
  const parameters = [];

  if (argsMatch && argsMatch[1].trim()) {
    const rawArgs = argsMatch[1].split(",").map((arg) => arg.trim());
    for (const arg of rawArgs) {
      const [name, rawType] = arg.split(":").map((str) => str.trim());
      parameters.push({
        name: name,
        type: tsTypeMap[rawType] || rawType,
      });
    }
  }
  return { class_name: className, function_name: functionName, parameters };
};

// ==========================================
// 3. THE INGESTION LOOP ENGINE
// ==========================================
const runIngestion = async () => {
  if (!fs.existsSync(problemsDirectory)) {
    return console.error(
      `❌ Target processing folder ${problemsDirectory} not found!`,
    );
  }

  const files = fs
    .readdirSync(problemsDirectory)
    .filter((file) => file.endsWith(".json"));

  console.log(
    `Found ${files.length} problem files. Uploading pipeline active...\n`,
  );

  let successCount = 0;

  for (let i = 0; i < files.length; i++) {
    const filePath = path.join(problemsDirectory, files[i]);
    const problem = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    try {
      let problemMetadata = null;
      const snippets = problem.code_snippets || {};

      if (snippets.cpp) {
        problemMetadata = extractFromCPP(snippets.cpp);
      }

      if (!problemMetadata && snippets.typescript) {
        problemMetadata = extractFromTS(snippets.typescript);
      }

      // Safe fallback if parsing fails (Design problems, SQL environments, etc.)
      if (!problemMetadata) {
        problemMetadata = {
          class_name: "Solution",
          function_name: "unknown",
          parameters: [],
        };
      }

      const safeLeetcodeId = parseInt(
        problem.problem_id || problem.frontend_id,
      );
      const safeSlug =
        problem.problemSlug ||
        problem.problem_slug ||
        `problem-${safeLeetcodeId}`;

      const dbRow = {
        id: safeSlug, // Primary alphanumeric key identifier
        title: problem.title || "Untitled Problem",
        difficulty: problem.difficulty
          ? problem.difficulty.toLowerCase()
          : "medium",
        description:
          problem.description ||
          "Description not available locally. Please view on LeetCode.",
        leetcode_id: safeLeetcodeId,
        likes: 0,
        dislikes: 0,
        problem_slug: safeSlug,
        examples: problem.examples || [],
        constraints: problem.constraints || [],
        hints: problem.hints || [],
        metadata: problemMetadata, // Cleaned object payload mapping
        code_snippets: snippets,
        test_cases: problem.examples || [], // Seeds examples as active initial test suites
      };

      // Upsert execution transaction matching unique constraints
      const { error: dbError } = await supabase.from("problems").upsert(dbRow, {
        onConflict: "leetcode_id",
      });

      if (dbError) throw dbError;

      successCount++;
      process.stdout.write(
        `\r✅ Ingested: ${successCount}/${files.length} components `,
      );
    } catch (error) {
      console.log(
        `\n❌ Ingestion fault encountered on file [${files[i]}]: ${error.message}`,
      );
    }
  }

  console.log(
    `\n\n🎉 Process ended. Successfully standardized and deployed ${successCount} total problems.`,
  );
};

runIngestion();
