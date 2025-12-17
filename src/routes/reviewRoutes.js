import express from "express";
import {
  getAllReviews,
  createReview,
  updateReviewResponse,
} from "../controllers/reviewController.js";
import { protect, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getAllReviews);
router.post("/", protect, createReview);
router.put(
  "/:id/response",
  protect,
  authorize("staff", "admin"),
  updateReviewResponse
);

export default router;
