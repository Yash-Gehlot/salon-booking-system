import cron from "node-cron";
import models from "../models/index.js";
import { Op } from "sequelize";
import { sendAppointmentReminder } from "./emailService.js";
import { sendAppointmentReminderSMS } from "./smsService.js";

const { Appointment, User, Staff, Service } = models;

export const startReminderCron = () => {
  cron.schedule("0 9 * * *", async () => {
    try {
      console.log("Running appointment reminder cron job...");

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowDate = tomorrow.toISOString().split("T")[0];

      const appointments = await Appointment.findAll({
        where: {
          appointmentDate: tomorrowDate,
          status: { [Op.in]: ["pending", "confirmed"] },
          reminderSent: false,
        },
        include: [
          { model: User, as: "customer" },
          { model: Staff, as: "staff", include: [{ model: User, as: "user" }] },
          { model: Service, as: "service" },
        ],
      });

      for (const appointment of appointments) {
        await sendAppointmentReminder(appointment);

        if (appointment.customer.phone) {
          await sendAppointmentReminderSMS(appointment);
        }

        appointment.reminderSent = true;
        await appointment.save();
      }

      console.log(`Sent ${appointments.length} reminders`);
    } catch (error) {
      console.error("Cron error:", error);
    }
  });

  console.log("Reminder cron scheduled");
};
