import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import cookieParser from "cookie-parser";
import sequelize from "./src/config/db.js";
import errorHandler from "./src/middlewares/errorHandler.js";

// Routes imports
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import serviceRoutes from "./src/routes/serviceRoutes.js";
import staffRoutes from "./src/routes/staffRoutes.js";
import appointmentRoutes from "./src/routes/appointmentRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
import reviewRoutes from "./src/routes/reviewRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ quiet: true });
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "src", "public")));

app.use(express.static(path.join(__dirname, "src", "views")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);

// View Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "views", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "views", "login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "views", "register.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "views", "dashboard.html"));
});

app.get("/services", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "views", "services.html"));
});

app.get("/booking", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "views", "booking.html"));
});

app.get("/appointments", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "views", "appointments.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "views", "admin.html"));
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Database connection and server start
sequelize
  .sync()
  .then(() => {
    console.log("Database connected");

    const PORT = process.env.PORT || 3003;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} 👀`);
    });
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });
