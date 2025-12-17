import models from "../models/index.js";

const { Review, Appointment, User, Staff } = models;

export const getAllReviews = async (req, res, next) => {
  try {
    const { staffId } = req.query;
    const whereClause = staffId ? { staffId } : {};

    const reviews = await Review.findAll({
      where: whereClause,
      include: [
        { model: User, as: "customer", attributes: ["name"] },
        {
          model: Staff,
          as: "staff",
          include: [{ model: User, as: "user", attributes: ["name"] }],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req, res, next) => {
  try {
    const { appointmentId, rating, comment } = req.body;

    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.customerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to review this appointment",
      });
    }

    if (appointment.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Can only review completed appointments",
      });
    }

    const review = await Review.create({
      appointmentId,
      customerId: req.user.id,
      staffId: appointment.staffId,
      rating,
      comment,
    });

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

export const updateReviewResponse = async (req, res, next) => {
  try {
    const { response } = req.body;

    const review = await Review.findByPk(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    review.response = response;
    await review.save();

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};
