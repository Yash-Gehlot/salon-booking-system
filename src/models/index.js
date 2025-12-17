import sequelize from "../config/db.js";

import User from "./userModel.js";
import Service from "./serviceModel.js";
import Staff from "./staffModel.js";
import Appointment from "./appointmentModel.js";
import Payment from "./paymentModel.js";
import Review from "./reviewModel.js";

const models = {
  User: User(sequelize),
  Service: Service(sequelize),
  Staff: Staff(sequelize),
  Appointment: Appointment(sequelize),
  Payment: Payment(sequelize),
  Review: Review(sequelize),
};

// Run associations
Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

models.sequelize = sequelize;

export default models;
