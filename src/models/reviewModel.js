import { DataTypes } from "sequelize";

const Review = (sequelize) => {
  const ReviewModel = sequelize.define(
    "Review",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      appointmentId: DataTypes.UUID,
      customerId: DataTypes.UUID,
      staffId: DataTypes.UUID,
      rating: {
        type: DataTypes.INTEGER,
        validate: { min: 1, max: 5 },
      },
      comment: DataTypes.TEXT,
      response: DataTypes.TEXT,
    },
    {
      tableName: "reviews",
      timestamps: false,
    }
  );

  ReviewModel.associate = (models) => {
    ReviewModel.belongsTo(models.Appointment, {
      foreignKey: "appointmentId",
      as: "appointment",
    });
    ReviewModel.belongsTo(models.User, {
      foreignKey: "customerId",
      as: "customer",
    });
    ReviewModel.belongsTo(models.Staff, { foreignKey: "staffId", as: "staff" });
  };

  return ReviewModel;
};

export default Review;
