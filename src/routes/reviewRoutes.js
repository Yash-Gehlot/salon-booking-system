import express from "express";
import {
  getAllReviews,
  getMyReviews,
  createReview,
  updateReviewResponse,
} from "../controllers/reviewController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getAllReviews);

router.get("/my-reviews", protect, getMyReviews);
router.post("/", protect, createReview);

router.put(
  "/:id/response",
  protect,

  updateReviewResponse
);

export default router;
