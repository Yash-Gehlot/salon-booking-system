import { DataTypes } from "sequelize";

const Service = (sequelize) => {
  const ServiceModel = sequelize.define(
    "Service",
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
      description: DataTypes.TEXT,
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      imageUrl: DataTypes.STRING,
    },
    {
      tableName: "services",
      timestamps: true,
    }
  );

  ServiceModel.associate = (models) => {
    ServiceModel.belongsToMany(models.Staff, {
      through: "StaffServices",
      foreignKey: "serviceId",
      as: "staff",
    });
    ServiceModel.hasMany(models.Appointment, {
      foreignKey: "serviceId",
      as: "appointments",
    });
  };

  return ServiceModel;
};

export default Service;
