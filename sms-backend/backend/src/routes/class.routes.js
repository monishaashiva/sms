import express from "express";
import {
  getAllClasses,
  createClass
} from "../controllers/class.controller.js";

const router = express.Router();

router.get("/", getAllClasses);      // GET classes
router.post("/", createClass);       // ADD class

export default router;
