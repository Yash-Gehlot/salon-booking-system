import Razorpay from "razorpay";
import config from "../config/config.js";

const razorpay = new Razorpay({
  key_id: config.razorpayKeyId,
  key_secret: config.razorpayKeySecret,
});

export const createRazorpayPayment = async (amount) => {
  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    return order;
  } catch (error) {
    console.error("Razorpay payment error:", error);
    throw error;
  }
};
