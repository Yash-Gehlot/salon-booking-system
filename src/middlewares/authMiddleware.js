import jwt from "jsonwebtoken";
import models from "../models/index.js";

const { User } = models;

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization"); //reads the Authorization header from the HTTP request.

    let token;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      //checking if token exist in header or not?
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      console.log("No token found in request");
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id);

    if (!user) {
      console.log("User not found for userId:", decoded.userId);
      return res.status(401).json({ message: "User not found." });
    }

    req.user = user; // This attaches user data to the request object, making it available in next functions.
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(403).json({ message: "Invalid token." });
  }
};
