const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();

mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDb is connected"))
  .catch((err) => console.log(err));

app.use(express.json());

// Routes
app.use("/users", require("./routes/users"));
app.use("/seeds", require("./routes/seeds"));
app.use('/trees', require('./routes/trees'));
app.use("/facts", require("./routes/facts"));

// Start the server
app.listen(process.env.PORT || 3000, () =>
  console.log(`Server started on port ${process.env.PORT || 3000}`)
);
