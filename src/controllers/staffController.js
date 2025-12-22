import models from "../models/index.js";
const { Staff, Service } = models;

export const getStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findByPk(req.params.id, {
      include: [
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

export const deleteStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findByPk(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    await staff.destroy();

    res.status(200).json({
      success: true,
      message: "Staff member permanently deleted",
    });
  } catch (error) {
    next(error);
  }
};

export const createStaff = async (req, res, next) => {
  try {
    const { name, email, phone, specialization, bio, serviceIds } = req.body;
    const staff = await Staff.create({
      name,
      email,
      phone,
      specialization,
      bio,
    });

    if (serviceIds?.length) {
      const services = await Service.findAll({ where: { id: serviceIds } });
      await staff.setServices(services);
    }

    res.status(201).json({ success: true, data: staff });
  } catch (error) {
    next(error);
  }
};

export const getAllStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findAll({
      include: [
        {
          model: Service,
          as: "services",
          through: { attributes: [] },
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff)
      return res
        .status(404)
        .json({ success: false, message: "Staff not found" });

    const { name, email, phone, specialization, bio, isActive, serviceIds } =
      req.body;
    await staff.update({ name, email, phone, specialization, bio, isActive });

    if (serviceIds) {
      const services = await Service.findAll({ where: { id: serviceIds } });
      await staff.setServices(services);
    }

    res.status(200).json({ success: true, data: staff });
  } catch (error) {
    next(error);
  }
};
