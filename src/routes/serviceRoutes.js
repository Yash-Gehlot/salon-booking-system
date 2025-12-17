import express from "express";
import {
  getAllServices,
  getService,
  createService,
  updateService,
  deleteService,
} from "../controllers/serviceController.js";

import { protect, authorize } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.get("/", getAllServices);
router.get("/:id", getService);
router.post("/", protect, authorize("admin"), createService);
router.put("/:id", protect, authorize("admin"), updateService);
router.delete("/:id", protect, authorize("admin"), deleteService);

export default router;
