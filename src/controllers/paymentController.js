import models from "../models/index.js";
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
} from "../services/paymentService.js";
import {
  sendAppointmentConfirmation,
  sendPaymentReceipt,
} from "../services/emailService.js";

const { Payment, Appointment, Service, User, Staff } = models;

export const createPaymentOrder = async (req, res, next) => {
  try {
    const { serviceId, staffId, appointmentDate, appointmentTime, notes } =
      req.body;

    const service = await Service.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    const amount = parseFloat(service.price);
    const receipt = `receipt_${Date.now()}`;

    const razorpayOrder = await createRazorpayOrder(amount, receipt);

    res.status(200).json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,

        appointmentData: {
          serviceId,
          staffId,
          appointmentDate,
          appointmentTime,
          notes,
        },
      },
    });
  } catch (error) {
    console.error("Payment order creation error:", error);
    next(error);
  }
};

export const verifyPaymentAndCreateAppointment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      appointmentData,
    } = req.body;

    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed. Invalid signature.",
      });
    }

    const service = await Service.findByPk(appointmentData.serviceId);

    const appointment = await Appointment.create({
      customerId: req.user.id,
      staffId: appointmentData.staffId,
      serviceId: appointmentData.serviceId,
      appointmentDate: appointmentData.appointmentDate,
      appointmentTime: appointmentData.appointmentTime,
      notes: appointmentData.notes,
      status: "confirmed", // Set to confirmed since payment is done
    });

    const payment = await Payment.create({
      appointmentId: appointment.id,
      amount: service.price,
      paymentMethod: "razorpay",
      transactionId: razorpay_payment_id,
      status: "completed",
    });

    const completeAppointment = await Appointment.findByPk(appointment.id, {
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

    try {
      await Promise.all([
        sendAppointmentConfirmation(completeAppointment),
        sendPaymentReceipt(completeAppointment, payment),
      ]);
      console.log("✅ All emails sent successfully");
    } catch (emailError) {
      console.error("⚠️ Failed to send email(s):", emailError.message);
    }

    res.status(201).json({
      success: true,
      message: "Payment successful and appointment created!",
      data: {
        appointment: completeAppointment,
        payment: payment,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    next(error);
  }
};

export const getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findByPk(req.params.id, {
      include: [{ model: Appointment, as: "appointment" }],
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};
