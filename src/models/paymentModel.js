import { DataTypes } from "sequelize";

const Payment = (sequelize) => {
  const PaymentModel = sequelize.define(
    "Payment",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      appointmentId: DataTypes.UUID,
      amount: DataTypes.DECIMAL(10, 2),
      paymentMethod: {
        type: DataTypes.ENUM("stripe", "razorpay", "cash"),
        allowNull: false,
      },
      transactionId: DataTypes.STRING,
      status: {
        type: DataTypes.ENUM("pending", "completed", "failed", "refunded"),
        defaultValue: "pending",
      },
      invoiceUrl: DataTypes.STRING,
    },
    {
      tableName: "payments",
      timestamps: false,
    }
  );

  PaymentModel.associate = (models) => {
    PaymentModel.belongsTo(models.Appointment, {
      foreignKey: "appointmentId",
      as: "appointment",
    });
  };

  return PaymentModel;
};

export default Payment;
