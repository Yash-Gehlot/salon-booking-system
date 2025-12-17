import models from "../models/index.js";
import { Op } from "sequelize";
import {
  sendAppointmentConfirmation,
  sendAppointmentReminder,
} from "../services/emailService.js";

const { Appointment, User, Staff, Service } = models;

export const getAllAppointments = async (req, res, next) => {
  try {
    const whereClause =
      req.user.role === "customer" ? { customerId: req.user.id } : {};

    const appointments = await Appointment.findAll({
      where: whereClause,
      include: [
        { model: User, as: "customer", attributes: ["name", "email", "phone"] },
        {
          model: Staff,
          as: "staff",
          include: [{ model: User, as: "user", attributes: ["name"] }],
        },
        { model: Service, as: "service" },
      ],
      order: [
        ["appointmentDate", "DESC"],
        ["appointmentTime", "DESC"],
      ],
    });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

export const getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        { model: User, as: "customer", attributes: ["name", "email", "phone"] },
        {
          model: Staff,
          as: "staff",
          include: [{ model: User, as: "user", attributes: ["name"] }],
        },
        { model: Service, as: "service" },
      ],
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (
      req.user.role === "customer" &&
      appointment.customerId !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this appointment",
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

export const getAvailableSlots = async (req, res, next) => {
  try {
    const { staffId, date } = req.query;

    if (!staffId || !date) {
      return res.status(400).json({
        success: false,
        message: "Staff ID and date are required",
      });
    }

    // Get all booked appointments for the staff on that date
    const bookedAppointments = await Appointment.findAll({
      where: {
        staffId,
        appointmentDate: date,
        status: { [Op.in]: ["pending", "confirmed"] },
      },
      attributes: ["appointmentTime"],
    });

    const bookedTimes = bookedAppointments.map((apt) => apt.appointmentTime);

    // Generate all possible time slots (e.g., 9 AM to 6 PM)
    const allSlots = [];
    for (let hour = 9; hour <= 18; hour++) {
      allSlots.push(`${hour.toString().padStart(2, "0")}:00`);
    }

    // Filter out booked slots
    const availableSlots = allSlots.filter(
      (slot) => !bookedTimes.includes(slot)
    );

    res.status(200).json({
      success: true,
      data: availableSlots,
    });
  } catch (error) {
    next(error);
  }
};

export const createAppointment = async (req, res, next) => {
  try {
    const { staffId, serviceId, appointmentDate, appointmentTime, notes } =
      req.body;

    const existingAppointment = await Appointment.findOne({
      where: {
        staffId,
        appointmentDate,
        appointmentTime,
        status: { [Op.in]: ["pending", "confirmed"] },
      },
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: "This time slot is already booked",
      });
    }

    const appointment = await Appointment.create({
      customerId: req.user.id,
      staffId,
      serviceId,
      appointmentDate,
      appointmentTime,
      notes,
      status: "pending",
    });

    const appointmentData = await Appointment.findByPk(appointment.id, {
      include: [
        { model: User, as: "customer" },
        {
          model: Staff,
          as: "staff",
          include: [{ model: User, as: "user" }],
        },
        { model: Service, as: "service" },
      ],
    });

    // Send confirmation email
    try {
      await sendAppointmentConfirmation(appointmentData);
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      data: appointmentData,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const { appointmentDate, appointmentTime, status, notes } = req.body;

    if (appointmentDate || appointmentTime) {
      const conflict = await Appointment.findOne({
        where: {
          staffId: appointment.staffId,
          appointmentDate: appointmentDate || appointment.appointmentDate,
          appointmentTime: appointmentTime || appointment.appointmentTime,
          status: { [Op.in]: ["pending", "confirmed"] },
          id: { [Op.ne]: appointment.id },
        },
      });

      if (conflict) {
        return res.status(400).json({
          success: false,
          message: "This time slot is already booked",
        });
      }
    }

    appointment.appointmentDate =
      appointmentDate || appointment.appointmentDate;
    appointment.appointmentTime =
      appointmentTime || appointment.appointmentTime;
    appointment.status = status || appointment.status;
    appointment.notes = notes || appointment.notes;

    await appointment.save();

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Check authorization
    if (
      req.user.role === "customer" &&
      appointment.customerId !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this appointment",
      });
    }

    appointment.status = "cancelled";
    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
    });
  } catch (error) {
    next(error);
  }
};
