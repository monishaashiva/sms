import express from "express";
import {
  getFeeStructure,
  addFeeStructure,
} from "../controllers/fee.controller.js";

const router = express.Router();

router.get("/structure", getFeeStructure);
router.post("/structure", addFeeStructure); 

export default router;
