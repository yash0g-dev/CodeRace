import asyncHandler from "express-async-handler";
import { executeOnCompiler } from "../utils/codeExecutor.js";

// @desc   Test code execution
// @route  POST /api/code/test
// @access Public
export const testExecution = asyncHandler(async (req, res) => {
  const { code, language } = req.body;

  if (!code || !language) {
    res.status(400);
    throw new Error("Please provide both code and language");
  }

  // Send the code to our OneCompiler utility
  const result = await executeOnCompiler(code, language);
  
  res.status(200).json(result);
});