import sgMail from "@sendgrid/mail";
import config from "../config/config.js";

const { sendgridApiKey, fromEmail } = config;

sgMail.setApiKey(sendgridApiKey);

export const sendAppointmentConfirmation = async (appointment) => {
  try {
    const msg = {
      to: appointment.customer.email,
      from: fromEmail,
      subject: "Appointment Confirmation",
      html: `
        <h2>Appointment Confirmed</h2>
        <p>Dear ${appointment.customer.name},</p>
        <ul>
          <li><strong>Service:</strong> ${appointment.service.name}</li>
          <li><strong>Date:</strong> ${appointment.appointmentDate}</li>
          <li><strong>Time:</strong> ${appointment.appointmentTime}</li>
          <li><strong>Staff:</strong> ${appointment.staff.user.name}</li>
          <li><strong>Price:</strong> $${appointment.service.price}</li>
        </ul>
      `,
    };

    await sgMail.send(msg);
    console.log("Confirmation email sent");
  } catch (error) {
    console.error("Error sending confirmation email:", error);
  }
};

export const sendAppointmentReminder = async (appointment) => {
  try {
    const msg = {
      to: appointment.customer.email,
      from: fromEmail,
      subject: "Appointment Reminder",
      html: `
        <h2>Appointment Reminder</h2>
        <p>Dear ${appointment.customer.name},</p>
        <ul>
          <li><strong>Service:</strong> ${appointment.service.name}</li>
          <li><strong>Date:</strong> ${appointment.appointmentDate}</li>
          <li><strong>Time:</strong> ${appointment.appointmentTime}</li>
          <li><strong>Staff:</strong> ${appointment.staff.user.name}</li>
        </ul>
      `,
    };

    await sgMail.send(msg);
    console.log("Reminder email sent");
  } catch (error) {
    console.error("Error sending reminder email:", error);
  }
};
