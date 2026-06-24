import fs from "fs";
import path from "path";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

console.log("⚡ Initializing CodeRace OneCompiler Local Testing Harness...");

// --- SETUP SUPABASE ---
const supabaseUrl =
  process.env.SUPABASE_URL ;
const supabaseKey =
  process.env.SUPABASE_SECRET_KEY ||
  const supabase = createClient(supabaseUrl, supabaseKey);

// --- LOCAL CONFIGURATION ---
const CONFIG = {
  PROBLEM_ID: 104,
  CPP_SOLUTION_FILE: "./max-depth.cpp",
  TEST_CASES_FILE: "./max-depth-tests.json",
  ONECOMPILER_API_URL: "https://onecompiler-apis.p.rapidapi.com/api/v1/run",
  API_KEY: process.env.RAPIDAPI_KEY || process.env.COMPILER_API_KEY,
};

const cppToCanonicalMap = {
  int: "integer",
  "long long": "long",
  double: "float",
  string: "string",
  bool: "boolean",
  "vector<int>": "integer[]",
  "vector<long long>": "long[]",
  "vector<vector<int>>": "integer[][]",
  "ListNode*": "linked_list",
  "TreeNode*": "binary_tree",
};

// ==========================================
// 1. NODE.JS INPUT SERIALIZATION (JSON -> STDIN String)
// ==========================================
const serializeToStdin = (val, type) => {
  if (val === null || val === undefined) return "0";

  if (
    ["integer", "long", "float", "boolean", "string", "character"].includes(
      type,
    )
  ) {
    return `${val}`;
  }
  if (
    [
      "integer[]",
      "long[]",
      "string[]",
      "character[]",
      "linked_list",
      "binary_tree",
    ].includes(type)
  ) {
    if (!Array.isArray(val)) return "0";
    const elements = val.map((v) => (v === null ? "null" : v)).join(" ");
    return `${val.length} ${elements}`;
  }
  if (type === "integer[][]" || type === "long[][]") {
    if (!Array.isArray(val)) return "0 0";
    let result = `${val.length} ${val[0]?.length || 0}`;
    for (const row of val) {
      result += " " + row.join(" ");
    }
    return result;
  }
  return "";
};

// ==========================================
// 2. GENERATIVE C++ BATCH WRAPPER BUILDER
// ==========================================
const generateBatchCppWrapper = (
  userClassCode,
  metadata,
  returnType,
  functionName,
) => {
  const cleanReturnType = returnType.trim();
  const canonicalReturnType =
    cppToCanonicalMap[cleanReturnType] || cleanReturnType;

  let code = `
#include <iostream>
#include <vector>
#include <string>
#include <queue>
#include <sstream>
using namespace std;

struct ListNode { int val; ListNode *next; ListNode(int x) : val(x), next(NULL) {} };
struct TreeNode { int val; TreeNode *left; TreeNode *right; TreeNode(int x) : val(x), left(NULL), right(NULL) {} };

ListNode* readLinkedList() {
    int size; if (!(cin >> size) || size == 0) return nullptr;
    int val; cin >> val;
    ListNode* head = new ListNode(val); ListNode* curr = head;
    for(int i = 1; i < size; i++) { cin >> val; curr->next = new ListNode(val); curr = curr->next; }
    return head;
}

TreeNode* readBinaryTree() {
    int size; if (!(cin >> size) || size == 0) return nullptr;
    vector<string> tokens(size); for(int i = 0; i < size; i++) cin >> tokens[i];
    if (tokens[0] == "null") return nullptr;
    TreeNode* root = new TreeNode(stoi(tokens[0])); queue<TreeNode*> q; q.push(root);
    int i = 1;
    while(!q.empty() && i < size) {
        TreeNode* curr = q.front(); q.pop();
        if (i < size && tokens[i] != "null") { curr->left = new TreeNode(stoi(tokens[i])); q.push(curr->left); }
        i++;
        if (i < size && tokens[i] != "null") { curr->right = new TreeNode(stoi(tokens[i])); q.push(curr->right); }
        i++;
    }
    return root;
}

void printOutput(int val) { cout << val; }
void printOutput(long long val) { cout << val; }
void printOutput(double val) { cout << val; }
void printOutput(string val) { cout << val; }
void printOutput(bool val) { cout << (val ? "true" : "false"); }
void printOutput(vector<int> const &vec) {
    for(size_t i = 0; i < vec.size(); i++) cout << vec[i] << (i == vec.size() - 1 ? "" : " ");
}
void printOutput(vector<long long> const &vec) {
    for(size_t i = 0; i < vec.size(); i++) cout << vec[i] << (i == vec.size() - 1 ? "" : " ");
}

${userClassCode}

int main() {
    int total_cases;
    if (!(cin >> total_cases)) return 0;
    Solution obj;
    for (int t = 0; t < total_cases; t++) {
        cout << "~CASE_START~" << endl;
`;

  const args = [];
  console.log(metadata);
  metadata.parameters.forEach((param, idx) => {
    const varName = `arg_${idx}`;
    args.push(varName);
    const cleanParamType = param.type.trim();
    const canonicalParamType =
      cppToCanonicalMap[cleanParamType] || cleanParamType;
    code += generateTypeParserCpp(canonicalParamType, varName, "  ");
  });

  code += `\n    // Read expected output checking variables\n`;
  code += `    int has_expected_check; cin >> has_expected_check;\n`;
  code += generateTypeParserCpp(canonicalReturnType, "expected_val", "    ");

  code += `
    auto result = obj.${functionName}(${args.join(", ")});
    cout << "OUTPUT: "; printOutput(result); cout << endl;
    if (has_expected_check == 1) {
      if (result != expected_val) {
          cout << "STATUS: FAILED" << endl; 
          cout << "~CASE_END~" << endl;
          return 0; 
      }
    }
    cout << "STATUS: PASSED" << endl;
    cout << "~CASE_END~" << endl;
  }
  return 0;
}\n`;

  return code;
};

const generateTypeParserCpp = (type, varName, tab) => {
  if (type === "integer") return `${tab}int ${varName}; cin >> ${varName};\n`;
  if (type === "long")
    return `${tab}long long ${varName}; cin >> ${varName};\n`;
  if (type === "float") return `${tab}double ${varName}; cin >> ${varName};\n`;
  if (type === "string") return `${tab}string ${varName}; cin >> ${varName};\n`;
  if (type === "boolean") return `${tab}bool ${varName}; cin >> ${varName};\n`;
  if (type === "linked_list")
    return `${tab}ListNode* ${varName} = readLinkedList();\n`;
  if (type === "binary_tree")
    return `${tab}TreeNode* ${varName} = readBinaryTree();\n`;
  if (type === "integer[]" || type === "long[]") {
    const inner = type === "long[]" ? "long long" : "int";
    return `${tab}int size_${varName}; cin >> size_${varName};\n${tab}vector<${inner}> ${varName}(size_${varName});\n${tab}for(int j=0; j<size_${varName}; j++) cin >> ${varName}[j];\n`;
  }
  return "";
};

const executionEngineRequest = async (sourceCode, stdinPayload) => {
  if (!CONFIG.API_KEY) throw new Error("Missing API key parameters.");
  const response = await axios.post(
    CONFIG.ONECOMPILER_API_URL,
    {
      language: "cpp",
      stdin: stdinPayload,
      files: [{ name: "index.cpp", content: sourceCode }],
    },
    {
      headers: {
        "content-type": "application/json",
        "X-RapidAPI-Key": CONFIG.API_KEY,
        "X-RapidAPI-Host": "onecompiler-apis.p.rapidapi.com",
      },
    },
  );
  return response.data;
};

// ==========================================
// 3. THE RUNNER ENGINE
// ==========================================
const testHarnessPipeline = async () => {
  try {
    const { data: problem, error: dbError } = await supabase
      .from("problems")
      .select("id, title, metadata")
      .eq("leetcode_id", CONFIG.PROBLEM_ID)
      .single();

    if (dbError || !problem)
      throw new Error(`Problem ID ${CONFIG.PROBLEM_ID} missing from database.`);

    if (!fs.existsSync(CONFIG.CPP_SOLUTION_FILE))
      throw new Error(`Solution missing: ${CONFIG.CPP_SOLUTION_FILE}`);
    if (!fs.existsSync(CONFIG.TEST_CASES_FILE))
      throw new Error(`Tests config file missing: ${CONFIG.TEST_CASES_FILE}`);

    const rawCppSolutionCode = fs.readFileSync(
      CONFIG.CPP_SOLUTION_FILE,
      "utf-8",
    );
    const testSuiteCases = JSON.parse(
      fs.readFileSync(CONFIG.TEST_CASES_FILE, "utf-8"),
    );

    // Extract return type and function name from the local solution file
    const matchSignature = rawCppSolutionCode.match(
      /([\w<>&:]+)\s+(\w+)\s*\(([^)]*)\)\s*\{/,
    );
    if (!matchSignature)
      throw new Error("Could not parse method signature from local file.");

    const returnType = matchSignature[1];
    const localFunctionName = matchSignature[2];
    const rawArgsStr = matchSignature[3];

    // 🔥 THE SELF-HEALING LAYER: Extract true parameter structures locally
    // 🔥 FIX: Pointer and Reference aware parameter splitter
    const localParameters = [];
    if (rawArgsStr.trim() !== "") {
      const rawArgs = rawArgsStr.split(",").map((arg) => arg.trim());
      for (const arg of rawArgs) {
        const parts = arg.split(/\s+/);
        let name = parts.pop();
        let rawType = parts.join("").trim();

        // If the asterisk stuck to the variable name (e.g., *root)
        if (name.startsWith("*")) {
          name = name.slice(1);
          rawType += "*";
        }

        // If a reference symbol stuck to the variable name (e.g., &nums)
        if (name.startsWith("&")) {
          name = name.slice(1);
          rawType += "&";
        }

        localParameters.push({ name, type: rawType });
      }
    }

    // Build the fixed metadata block dynamically
    const activeMetadata = {
      class_name: problem.metadata?.class_name || "Solution",
      function_name: localFunctionName,
      parameters: localParameters,
    };

    console.log(
      `\n🔥 Processing Dynamic Batch Execution Suite: "${problem.title}"`,
    );
    console.log(
      `   Isolated Local Parameters: ${JSON.stringify(localParameters)}`,
    );

    let stdinPayload = `${testSuiteCases.length}\n`;
    testSuiteCases.forEach((tc) => {
      activeMetadata.parameters.forEach((param, idx) => {
        stdinPayload +=
          serializeToStdin(
            tc.inputs[idx],
            cppToCanonicalMap[param.type] || param.type,
          ) + "\n";
      });

      if (tc.expected !== undefined) {
        stdinPayload += `1\n${serializeToStdin(tc.expected, cppToCanonicalMap[returnType] || returnType)}\n`;
      } else {
        stdinPayload += `0\n0\n`;
      }
    });

    const finalCompiledSource = generateBatchCppWrapper(
      rawCppSolutionCode,
      activeMetadata, // Pass clean, dynamic local variables instead
      returnType,
      localFunctionName,
    );

    console.log(`   📡 Shipping batch suite payload to OneCompiler API...`);
    const runResult = await executionEngineRequest(
      finalCompiledSource,
      stdinPayload,
    );

    if (runResult.stderr || runResult.exception) {
      console.log("\n❌ COMPILATION OR PROCESS RUNTIME FAULT DETECTED:");
      console.error(runResult.stderr || runResult.exception);
      return;
    }

    console.log("\n================ ENGINE RESULT METRICS ================");
    console.log(`⏱️ Execution Time : ${runResult.executionTime || "N/A"} ms`);
    console.log(`💾 Process Memory : ${runResult.memory || "N/A"} KB`);
    console.log("=======================================================");

    const stdoutBlocks = runResult.stdout
      .split("~CASE_START~")
      .map((b) => b.trim())
      .filter(Boolean);
    const updatedDatabasePayload = [];
    let processingHalted = false;

    for (let idx = 0; idx < testSuiteCases.length; idx++) {
      const originalCase = testSuiteCases[idx];
      const caseResultBlock = stdoutBlocks[idx];

      if (!caseResultBlock || caseResultBlock.includes("STATUS: FAILED")) {
        console.log(
          `❌ Test Case [${idx + 1}/${testSuiteCases.length}] FAILED validation logic.`,
        );
        if (caseResultBlock)
          console.log(`   📄 Captured Trace Log:\n${caseResultBlock}`);
        processingHalted = true;
        break;
      }

      const outputMatch = caseResultBlock.match(/OUTPUT:\s*(.*)/);
      const rawCaseStdout = outputMatch ? outputMatch[1].trim() : "";
      const cleanCalculatedTruth =
        originalCase.expected !== undefined
          ? originalCase.expected
          : parseInt(rawCaseStdout, 10);

      console.log(`✅ Test Case [${idx + 1}/${testSuiteCases.length}] PASSED.`);

      updatedDatabasePayload.push({
        is_hidden:
          originalCase.is_hidden !== undefined ? originalCase.is_hidden : true,
        inputs: originalCase.inputs,
        expected: cleanCalculatedTruth,
      });
    }

    if (!processingHalted) {
      console.log(
        "\n💾 Updating verified test cases AND fixing metadata in Supabase...",
      );
      const { error: updateError } = await supabase
        .from("problems")
        .update({
          test_cases: updatedDatabasePayload,
          metadata: activeMetadata, // Overwrites the poisoned database record automatically!
        })
        .eq("leetcode_id", CONFIG.PROBLEM_ID);

      if (updateError) throw updateError;
      console.log(
        "🎉 Verification Complete! Database healed and updated successfully.",
      );
    }
  } catch (error) {
    console.error(`\n🚨 CRITICAL ERROR: ${error.message}`);
  }
};

testHarnessPipeline();
