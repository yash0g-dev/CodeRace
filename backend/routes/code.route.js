import express from "express";
import { testExecution } from "../controllers/code.controller.js";

const router = express.Router();

router.post("/test", testExecution);

export default router;