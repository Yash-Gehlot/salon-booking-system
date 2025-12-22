import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import config from "../config/config.js";

const { jwtSecret, jwtExpire } = config;

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (enteredPassword, hashedPassword) => {
  return bcrypt.compare(enteredPassword, hashedPassword);
};

export const generateToken = (id) => {
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: jwtExpire,
  });
};

export const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user.id);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
};
