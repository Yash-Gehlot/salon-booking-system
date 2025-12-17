import models from "../models/index.js";
import { createRazorpayPayment } from "../services/paymentService.js";

const { Payment, Appointment, Service } = models;

export const createPayment = async (req, res, next) => {
  try {
    const { appointmentId, paymentMethod } = req.body;

    const appointment = await Appointment.findByPk(appointmentId, {
      include: [{ model: Service, as: "service" }],
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const amount = appointment.service.price;

    let paymentIntent;
    if (paymentMethod === "stripe") {
      paymentIntent = await createRazorpayPayment.createStripePayment(amount);
    } else if (paymentMethod === "razorpay") {
      paymentIntent = await createRazorpayPayment.createRazorpayPayment(amount);
    }

    const payment = await Payment.create({
      appointmentId,
      amount,
      paymentMethod,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      data: {
        payment,
        clientSecret: paymentIntent.clientSecret || paymentIntent.id,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { paymentId, transactionId } = req.body;

    const payment = await Payment.findByPk(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    payment.transactionId = transactionId;
    payment.status = "completed";
    await payment.save();

    const appointment = await Appointment.findByPk(payment.appointmentId);
    appointment.status = "confirmed";
    await appointment.save();

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
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
