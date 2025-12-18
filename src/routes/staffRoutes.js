import express from "express";
import {
  getAllStaff,
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
} from "../controllers/staffController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getAllStaff);
router.get("/:id", getStaff);
router.post("/", createStaff);
router.put("/:id", updateStaff);
router.delete("/:id", deleteStaff);

export default router;
