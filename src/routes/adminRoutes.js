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
  adminLogin,
  updateAppointmentStatus,
} from "../controllers/adminController.js";

import { protectAdmin } from "../middlewares/adminAuthMiddleware.js";

const router = express.Router();

router.post("/login", adminLogin);
router.get("/users", protectAdmin, getAllUsers); //✅
router.get("/appointments", protectAdmin, getAllAppointments); //✅
router.put("/appointments/:id", protectAdmin, updateAppointmentStatus);

router.get("/statistics", protectAdmin, getStatistics); //✅

router.get("/allServices", getAllServices); //✅
router.get("/service/:id", protectAdmin, getService); //✅
router.post("/createService", protectAdmin, createService); //✅
router.put("/service/:id", protectAdmin, updateService); //✅
router.delete("/service/:id", protectAdmin, deleteService); //✅

export default router;
