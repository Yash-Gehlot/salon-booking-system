import express from "express";
import {
  getAllUsers,
  getAllAppointments,
  getStatistics,
} from "../controllers/adminController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));

router.get("/users", getAllUsers);
router.get("/appointments", getAllAppointments);
router.get("/statistics", getStatistics);

export default router;
