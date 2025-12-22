import models from "../models/index.js";

const { Review, Appointment, User, Staff, Service } = models;

export const getAllReviews = async (req, res, next) => {
  try {
    const { staffId, minRating } = req.query;
    const whereClause = {};

    if (staffId) whereClause.staffId = staffId;
    if (minRating)
      whereClause.rating = {
        [models.sequelize.Sequelize.Op.gte]: parseInt(minRating),
      };

    const reviews = await Review.findAll({
      where: whereClause,
      include: [
        { model: User, as: "customer", attributes: ["name"] },
        { model: Staff, as: "staff", attributes: ["name", "specialization"] },
        {
          model: Appointment,
          as: "appointment",
          include: [{ model: Service, as: "service", attributes: ["name"] }],
        },
      ],
      order: [["rating", "DESC"]],
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

export const getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.findAll({
      where: { customerId: req.user.id },
      include: [
        { model: Staff, as: "staff", attributes: ["name", "specialization"] },
        {
          model: Appointment,
          as: "appointment",
          attributes: ["appointmentDate", "appointmentTime"],
          include: [{ model: Service, as: "service", attributes: ["name"] }],
        },
      ],
      order: [["rating", "DESC"]],
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

    if (!appointmentId || !rating) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID and rating are required",
      });
    }

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

    const existingReview = await Review.findOne({ where: { appointmentId } });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this appointment",
      });
    }

    const review = await Review.create({
      appointmentId,
      customerId: req.user.id,
      staffId: appointment.staffId,
      serviceId: appointment.serviceId,
      rating,
      comment: comment || "",
    });

    const reviewData = await Review.findByPk(review.id, {
      include: [
        { model: User, as: "customer", attributes: ["name"] },
        { model: Staff, as: "staff", attributes: ["name", "specialization"] },
        { model: Service, as: "service", attributes: ["name"] },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: reviewData,
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
      message: "Response added successfully",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};
