import models from "../models/index.js";
import { Op, fn, col } from "sequelize";

const { User, Appointment, Service, Staff, Payment, Review } = models;

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const getAllAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.findAll({
      include: [
        { model: User, as: "customer" },
        { model: Staff, as: "staff", include: [{ model: User, as: "user" }] },
        { model: Service, as: "service" },
        { model: Payment, as: "payment" },
      ],
    });

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    next(error);
  }
};

export const getStatistics = async (req, res, next) => {
  try {
    const stats = {
      users: await User.count({ where: { role: "customer" } }),
      staff: await Staff.count({ where: { isActive: true } }),
      services: await Service.count({ where: { isActive: true } }),
      revenue:
        (await Payment.sum("amount", { where: { status: "completed" } })) || 0,
    };

    const avgRating = await Review.findOne({
      attributes: [[fn("AVG", col("rating")), "avgRating"]],
    });

    res.status(200).json({
      success: true,
      data: {
        ...stats,
        averageRating: avgRating?.dataValues?.avgRating || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
