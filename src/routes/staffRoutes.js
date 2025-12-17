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
router.post("/", protect, authorize("admin"), createStaff);
router.put("/:id", protect, authorize("admin"), updateStaff);
router.delete("/:id", protect, authorize("admin"), deleteStaff);

export default router;
