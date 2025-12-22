import express from "express";
import {
  getAllStaff,
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
} from "../controllers/staffController.js";
import { protectAdmin } from "../middlewares/adminAuthMiddleware.js";
const router = express.Router();

router.get("/all", getAllStaff);  
router.get("/profile/:id", protectAdmin, getStaff);  
router.post("/create", protectAdmin, createStaff); 
router.put("/update/:id", protectAdmin, updateStaff); 
router.delete("/delete/:id", protectAdmin, deleteStaff); 
export default router;
