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
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      specialization: DataTypes.STRING,
      bio: DataTypes.TEXT,
      availability: DataTypes.JSON,
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "staff",
      timestamps: false,
    }
  );

  StaffModel.associate = (models) => {
    StaffModel.belongsTo(models.User, { foreignKey: "userId", as: "user" });
    StaffModel.belongsToMany(models.Service, {
      through: "StaffServices",
      foreignKey: "staffId",
      as: "services",
    });
    StaffModel.hasMany(models.Appointment, {
      foreignKey: "staffId",
      as: "appointments",
    });
    StaffModel.hasMany(models.Review, { foreignKey: "staffId", as: "reviews" });
  };

  return StaffModel;
};

export default Staff;
