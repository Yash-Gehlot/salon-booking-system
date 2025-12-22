import jwt from "jsonwebtoken";

export const protectAdmin = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    let token;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      console.log("No admin token found in request");
      return res.status(401).json({
        success: false,
        message: "Access denied. Admin authentication required.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.isAdmin || decoded.role !== "admin") {
      console.log("Token does not have admin privileges");
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    req.admin = decoded;
    next();
  } catch (err) {
    console.error("Admin auth error:", err.message);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }

    return res.status(403).json({
      success: false,
      message: "Invalid admin token.",
    });
  }
};
