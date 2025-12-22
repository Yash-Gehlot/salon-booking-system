import { DataTypes } from "sequelize";

const Staff = (sequelize) => {
  const StaffModel = sequelize.define(
    "Staff",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      phone: {
        type: DataTypes.STRING,
      },
      specialization: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      bio: {
        type: DataTypes.TEXT,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true, // Used for "Firing" staff without deleting data
      },
    },
    {
      tableName: "staff",
      timestamps: false,
    }
  );

  StaffModel.associate = (models) => {
    // Staff can still perform many services
    StaffModel.belongsToMany(models.Service, {
      through: "StaffServices",
      foreignKey: "staffId",
      as: "services",
    });

    // Staff still has appointments assigned to them
    StaffModel.hasMany(models.Appointment, {
      foreignKey: "staffId",
      as: "appointments",
    });
  };

  return StaffModel;
};

export default Staff;
