import express from "express";
import {
  getAllUsers,
  getAllAppointments,
  getStatistics,
  getAllServices,
  getService,
  createService,
  updateService,
  deleteService,
} from "../controllers/adminController.js";

import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

// router.use(protect);
// router.use(authorize("admin"));

router.get("/users", getAllUsers); //✅
router.get("/appointments", getAllAppointments); //✅
router.get("/statistics", getStatistics); //✅

router.get("/allServices", getAllServices); //✅
router.get("/service/:id", getService); //✅
router.post("/createService", createService); //✅
router.put("/service/:id", updateService); //✅
router.delete("/service/:id", deleteService); //✅

export default router;
