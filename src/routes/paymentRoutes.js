import express from "express";
import {
  createPayment,
  verifyPayment,
  getPayment,
} from "../controllers/paymentController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create", protect, createPayment);
router.post("/verify", protect, verifyPayment);
router.get("/:id", protect, getPayment);

export default router;
