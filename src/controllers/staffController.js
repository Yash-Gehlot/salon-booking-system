import models from "../models/index.js";
import { hashPassword } from "../utils/helpers.js";

const { Staff, User, Service } = models;

export const getAllStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findAll({
      where: { isActive: true },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["name", "email", "phone", "profileImage"],
        },
        {
          model: Service,
          as: "services",
          through: { attributes: [] },
        },
      ],
    });

    res.status(200).json({
      success: true,
      count: staff.length,
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

export const getStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["name", "email", "phone", "profileImage"],
        },
        {
          model: Service,
          as: "services",
          through: { attributes: [] },
        },
      ],
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    res.status(200).json({
      success: true,
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

export const createStaff = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      specialization,
      bio,
      availability,
      serviceIds,
    } = req.body;

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: "staff",
    });

    const staff = await Staff.create({
      userId: user.id,
      specialization,
      bio,
      availability,
    });

    if (serviceIds?.length) {
      const services = await Service.findAll({
        where: { id: serviceIds },
      });
      await staff.setServices(services);
    }

    const staffData = await Staff.findByPk(staff.id, {
      include: [
        { model: User, as: "user" },
        { model: Service, as: "services" },
      ],
    });

    res.status(201).json({
      success: true,
      data: staffData,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findByPk(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    const { specialization, bio, availability, isActive, serviceIds } =
      req.body;

    staff.specialization = specialization || staff.specialization;
    staff.bio = bio || staff.bio;
    staff.availability = availability || staff.availability;
    staff.isActive = isActive !== undefined ? isActive : staff.isActive;

    await staff.save();

    if (serviceIds?.length) {
      const services = await Service.findAll({
        where: { id: serviceIds },
      });
      await staff.setServices(services);
    }

    const staffData = await Staff.findByPk(staff.id, {
      include: [
        { model: User, as: "user" },
        { model: Service, as: "services" },
      ],
    });

    res.status(200).json({
      success: true,
      data: staffData,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findByPk(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    staff.isActive = false;
    await staff.save();

    res.status(200).json({
      success: true,
      message: "Staff member deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
