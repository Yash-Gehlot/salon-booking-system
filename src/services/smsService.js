import twilio from "twilio";
import config from "../config/config.js";

const { twilioAccountSid, twilioAuthToken, twilioPhoneNumber } = config;

const client = twilio(twilioAccountSid, twilioAuthToken);

export const sendSMS = async (to, message) => {
  try {
    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to,
    });

    console.log("SMS sent:", result.sid);
    return result;
  } catch (error) {
    console.error("Error sending SMS:", error);
  }
};

export const sendAppointmentReminderSMS = async (appointment) => {
  try {
    const message = `Reminder: You have an appointment on ${appointment.appointmentDate} at ${appointment.appointmentTime} for ${appointment.service.name}.`;

    await sendSMS(appointment.customer.phone, message);
  } catch (error) {
    console.error("Error sending reminder SMS:", error);
  }
};
