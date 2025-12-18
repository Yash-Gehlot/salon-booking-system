import { DataTypes } from "sequelize";

const User = (sequelize) => {
  const UserModel = sequelize.define(
    "User",
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
        validate: { isEmail: true },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: DataTypes.STRING,
      role: {
        type: DataTypes.ENUM("customer", "staff", "admin"),
        defaultValue: "customer",
      },
    },
    {
      tableName: "users",
      timestamps: false,
    }
  );

  UserModel.associate = (models) => {
    UserModel.hasMany(models.Appointment, {
      foreignKey: "customerId",
      as: "appointments",
    });
    UserModel.hasOne(models.Staff, {
      foreignKey: "userId",
      as: "staffProfile",
    });
    UserModel.hasMany(models.Review, {
      foreignKey: "customerId",
      as: "reviews",
    });
  };

  return UserModel;
};

export default User;
