import express from "express";
import dotenv from "dotenv";
import path from "path"; // Node's path module to handle file/folder paths.
import { fileURLToPath } from "url"; // utility to convert file URLs to regular file paths (needed for ES modules).

import sequelize from "./src/config/db.js";
import errorHandler from "./src/middlewares/errorHandler.js";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import staffRoutes from "./src/routes/staffRoutes.js";
import appointmentRoutes from "./src/routes/appointmentRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
import reviewRoutes from "./src/routes/reviewRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";

const __filename = fileURLToPath(import.meta.url); //having current file's directory path (ES modules don't have __dirname by default).
const __dirname = path.dirname(__filename);

dotenv.config({ quiet: true });
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "src", "public")));
app.use(express.static(path.join(__dirname, "src", "views")));

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/staff", staffRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/payments", paymentRoutes);
app.use("/reviews", reviewRoutes);
app.use("/admin", adminRoutes);

app.use(errorHandler);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "views", "index.html"));
});

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
