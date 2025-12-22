import models from "../models/index.js";
import { Op } from "sequelize";
import {
  sendAppointmentConfirmation,
  sendAppointmentCancellation,
} from "../services/emailService.js";

const { Appointment, User, Staff, Service } = models;

export const getAllAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.findAll({
      where: {
        customerId: req.user.id,
      },
      include: [
        {
          model: User,
          as: "customer",
          where: { id: req.user.id },
          required: true,
          attributes: ["id", "name", "email", "phone"],
        },
        {
          model: Staff,
          as: "staff",
          attributes: ["id", "name", "email", "phone", "specialization"],
        },
        { model: Service, as: "service" },
      ],
      order: [["appointmentDate", "DESC"]],
    });

    res.status(200).json({
      success: true,
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
          attributes: ["id", "name", "email", "phone", "specialization"],
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

    const bookedAppointments = await Appointment.findAll({
      where: {
        staffId,
        appointmentDate: date,
        status: { [Op.in]: ["pending", "confirmed"] },
      },
      attributes: ["appointmentTime"],
    });

    const bookedTimes = bookedAppointments.map((apt) => apt.appointmentTime);

    const allSlots = [];
    for (let hour = 9; hour <= 18; hour++) {
      allSlots.push(`${hour.toString().padStart(2, "0")}:00`);
    }

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
          attributes: ["id", "name", "email", "phone", "specialization"],
        },
        { model: Service, as: "service" },
      ],
    });

    // Send confirmation email
    try {
      await sendAppointmentConfirmation(appointmentData);
    } catch (emailError) {
      console.error(
        "⚠️ Failed to send confirmation email:",
        emailError.message
      );
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

    if (appointment.customerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this appointment",
      });
    }

    if (
      appointment.status === "completed" ||
      appointment.status === "cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message: "Cannot reschedule completed or cancelled appointments",
      });
    }

    const { appointmentDate, appointmentTime } = req.body;

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
      message: "Appointment rescheduled successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
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

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    appointment.status = "cancelled";
    await appointment.save();

    // Send cancellation email
    try {
      await sendAppointmentCancellation(appointment);
      console.log("✅ Cancellation email sent");
    } catch (emailError) {
      console.error(
        "⚠️ Failed to send cancellation email:",
        emailError.message
      );
      // Don't fail the request if email fails
    }

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
    });
  } catch (error) {
    next(error);
  }
};
