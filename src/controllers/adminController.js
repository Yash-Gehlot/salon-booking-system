import models from "../models/index.js";
import { Op, fn, col } from "sequelize";

const { User, Appointment, Service, Staff, Payment, Review } = models;

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
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

export const getAllServices = async (req, res, next) => {
  try {
    const services = await Service.findAll({
      where: { isActive: true },
      include: [
        {
          model: Staff,
          as: "staff",
          through: { attributes: [] },
        },
      ],
    });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    next(error);
    hy;
  }
};

export const getService = async (req, res, next) => {
  try {
    const service = await Service.findByPk(req.params.id, {
      include: [
        {
          model: Staff,
          as: "staff",
          through: { attributes: [] },
        },
      ],
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

export const createService = async (req, res, next) => {
  try {
    const { name, description, duration, price, imageUrl } = req.body;

    const service = await Service.create({
      name,
      description,
      duration,
      price,
      imageUrl,
    });

    res.status(201).json({
      success: true,
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

export const updateService = async (req, res, next) => {
  try {
    const service = await Service.findByPk(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    const { name, description, duration, price, imageUrl, isActive } = req.body;

    service.name = name || service.name;
    service.description = description || service.description;
    service.duration = duration || service.duration;
    service.price = price || service.price;
    service.imageUrl = imageUrl || service.imageUrl;
    service.isActive = isActive !== undefined ? isActive : service.isActive;

    await service.save();

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByPk(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    service.isActive = false;
    await service.save();

    res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
