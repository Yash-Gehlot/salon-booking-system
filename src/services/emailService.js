import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: "9bbac1001@smtp-brevo.com",
    pass: process.env.SENDINBLUE_SMTP_KEY,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email transporter error:", error);
    console.log("💡 TIP: Check your SENDINBLUE_SMTP_KEY in .env file");
  } else {
    console.log("✅ Email server is ready to send messages");
  }
});

export const sendAppointmentConfirmation = async (appointment) => {
  try {
    const emailText = `
Dear ${appointment.customer.name},

Your appointment has been confirmed!

APPOINTMENT DETAILS:
-------------------
Service: ${appointment.service.name}
Date: ${appointment.appointmentDate}
Time: ${appointment.appointmentTime}
Staff Member: ${appointment.staff.name}
Price: ₹${appointment.service.price}

${appointment.notes ? `Notes: ${appointment.notes}\n` : ""}
Status: ${appointment.status.toUpperCase()}

Please arrive 5-10 minutes early for your appointment.

If you need to reschedule or cancel, please contact us as soon as possible.

Thank you for choosing our salon!

Best regards,
Salon Management Team
    `.trim();

    const mailOptions = {
      from: `"Salon Booking" <${
        process.env.FROM_EMAIL || "noreply@yoursalon.com"
      }>`,
      to: appointment.customer.email,
      subject: "Appointment Confirmation - Salon Booking",
      text: emailText,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Confirmation email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending confirmation email:", error.message);
    throw error;
  }
};

//  Sending payment receipt email
export const sendPaymentReceipt = async (appointment, payment) => {
  try {
    const emailText = `
Dear ${appointment.customer.name},

Thank you for your payment!

PAYMENT RECEIPT:
----------------
Transaction ID: ${payment.transactionId}
Amount Paid: ₹${payment.amount}
Payment Method: ${payment.paymentMethod.toUpperCase()}
Payment Status: ${payment.status.toUpperCase()}
Payment Date: ${new Date().toLocaleDateString()}

APPOINTMENT DETAILS:
-------------------
Service: ${appointment.service.name}
Date: ${appointment.appointmentDate}
Time: ${appointment.appointmentTime}
Staff Member: ${appointment.staff.name}

Your appointment is now confirmed. We look forward to serving you!

If you have any questions, please don't hesitate to contact us.

Thank you for choosing our salon!

Best regards,
Salon Management Team
    `.trim();

    const mailOptions = {
      from: `"Salon Booking" <${
        process.env.FROM_EMAIL || "noreply@yoursalon.com"
      }>`,
      to: appointment.customer.email,
      subject: "Payment Receipt - Salon Booking",
      text: emailText,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Payment receipt sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending payment receipt:", error.message);
    throw error;
  }
};

//  Send appointment reminder email (24 hours before)

export const sendAppointmentReminder = async (appointment) => {
  try {
    const emailText = `
Dear ${appointment.customer.name},

This is a friendly reminder about your upcoming appointment!

APPOINTMENT DETAILS:
-------------------
Service: ${appointment.service.name}
Date: ${appointment.appointmentDate}
Time: ${appointment.appointmentTime}
Staff Member: ${appointment.staff.name}

Please arrive 5-10 minutes early for your appointment.

If you need to cancel or reschedule, please contact us as soon as possible.

We look forward to seeing you!

Best regards,
Salon Management Team
    `.trim();

    const mailOptions = {
      from: `"Salon Booking" <${
        process.env.FROM_EMAIL || "noreply@yoursalon.com"
      }>`,
      to: appointment.customer.email,
      subject: "Appointment Reminder - Tomorrow",
      text: emailText,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Reminder email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending reminder email:", error.message);
    throw error;
  }
};

//  * Send appointment cancellation email

export const sendAppointmentCancellation = async (appointment) => {
  try {
    const emailText = `
Dear ${appointment.customer.name},

Your appointment has been cancelled.

CANCELLED APPOINTMENT:
---------------------
Service: ${appointment.service.name}
Date: ${appointment.appointmentDate}
Time: ${appointment.appointmentTime}
Staff Member: ${appointment.staff.name}

If you would like to reschedule, please visit our website or contact us.

We hope to serve you again soon!

Best regards,
Salon Management Team
    `.trim();

    const mailOptions = {
      from: `"Salon Booking" <${
        process.env.FROM_EMAIL || "noreply@yoursalon.com"
      }>`,
      to: appointment.customer.email,
      subject: "Appointment Cancelled - Salon Booking",
      text: emailText,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Cancellation email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending cancellation email:", error.message);
    throw error;
  }
};

export default transporter;
