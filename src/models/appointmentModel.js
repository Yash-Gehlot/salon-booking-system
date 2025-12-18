import { DataTypes } from "sequelize";

const Appointment = (sequelize) => {
  const AppointmentModel = sequelize.define(
    "Appointment",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      customerId: DataTypes.UUID,
      staffId: DataTypes.UUID,
      serviceId: DataTypes.UUID,
      appointmentDate: DataTypes.DATEONLY,
      appointmentTime: DataTypes.TIME,
      status: {
        type: DataTypes.ENUM(
          "pending",
          "confirmed",
          "completed",
          "cancelled",
          "rescheduled"
        ),
        defaultValue: "pending",
      },
      notes: DataTypes.TEXT,
      reminderSent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "appointments",
      timestamps: false,
    }
  );

  AppointmentModel.associate = (models) => {
    AppointmentModel.belongsTo(models.User, {
      foreignKey: "customerId",
      as: "customer",
    });
    AppointmentModel.belongsTo(models.Staff, {
      foreignKey: "staffId",
      as: "staff",
    });
    AppointmentModel.belongsTo(models.Service, {
      foreignKey: "serviceId",
      as: "service",
    });
    AppointmentModel.hasOne(models.Payment, {
      foreignKey: "appointmentId",
      as: "payment",
    });
    AppointmentModel.hasOne(models.Review, {
      foreignKey: "appointmentId",
      as: "review",
    });
  };

  return AppointmentModel;
};

export default Appointment;
