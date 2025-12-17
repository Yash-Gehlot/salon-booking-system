import express from "express";
import {
  getAllAppointments,
  getAppointment,
  getAvailableSlots,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../controllers/appointmentController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getAllAppointments);
router.get("/available-slots", getAvailableSlots);
router.get("/:id", protect, getAppointment);
router.post("/", protect, createAppointment);
router.put("/:id", protect, updateAppointment);
router.delete("/:id", protect, deleteAppointment);

export default router;
