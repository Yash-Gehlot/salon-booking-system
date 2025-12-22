import express from "express";
import {
  createPaymentOrder,
  verifyPaymentAndCreateAppointment,
  getPayment,
} from "../controllers/paymentController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create-order", protect, createPaymentOrder);
router.post("/verify", protect, verifyPaymentAndCreateAppointment);
router.get("/:id", protect, getPayment);

export default router;
