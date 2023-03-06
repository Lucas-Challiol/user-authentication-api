const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

mongoose
  .connect(process.env.MONGODB_URI, {})
  .catch((err) => console.log(err));