import express from 'express';
import { executeCode, runSampleCode } from '../controllers/code.controller.js';

const router = express.Router();

// Maps to frontend Submit button (Hidden test cases + match logic)
router.post('/execute', executeCode);

// Maps to frontend Run button (Sample test cases + stdout/stderr only)
router.post('/run', runSampleCode);

export default router;