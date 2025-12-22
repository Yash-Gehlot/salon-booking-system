import models from "../models/index.js";
import jwt from "jsonwebtoken";

const { User, Appointment, Service, Staff, Payment } = models;

export const adminLogin = async (req, res, next) => {
  try {
    const { secretKey } = req.body;

    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(401).json({
        success: false,
        message: "Invalid secret key",
      });
    }

    const token = jwt.sign(
      { role: "admin", isAdmin: true },
      process.env.JWT_SECRET
    );

    res.status(200).json({
      success: true,
      token,
      message: "Admin login successful",
    });
  } catch (error) {
    next(error);
  }
};

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
        { model: Staff, as: "staff" },
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
    const stats = {};

    try {
      stats.users = await User.count();
    } catch (e) {
      console.error("Error counting users:", e.message);
      stats.users = 0;
    }

    try {
      stats.staff = await Staff.count({ where: { isActive: true } });
    } catch (e) {
      console.error("Error counting staff:", e.message);
      stats.staff = 0;
    }

    try {
      stats.services = await Service.count({ where: { isActive: true } });
    } catch (e) {
      console.error("Error counting services:", e.message);
      stats.services = 0;
    }

    try {
      stats.revenue =
        (await Payment.sum("amount", { where: { status: "completed" } })) || 0;
    } catch (e) {
      console.error("Error calculating revenue:", e.message);
      stats.revenue = 0;
    }

    res.status(200).json({
      success: true,
      data: {
        ...stats,
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

export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const { appointmentDate, appointmentTime, status, notes } = req.body;

    if (appointmentDate) appointment.appointmentDate = appointmentDate;
    if (appointmentTime) appointment.appointmentTime = appointmentTime;
    if (status) appointment.status = status;
    if (notes !== undefined) appointment.notes = notes;

    await appointment.save();

    const updatedAppointment = await Appointment.findByPk(appointment.id, {
      include: [
        { model: User, as: "customer", attributes: ["name", "email", "phone"] },
        {
          model: Staff,
          as: "staff",
          attributes: ["id", "name", "email", "phone", "specialization"],
        },
        { model: Service, as: "service" },
      ],
    });

    res.status(200).json({
      success: true,
      data: updatedAppointment,
      message: "Appointment updated successfully",
    });
  } catch (error) {
    next(error);
  }
};
