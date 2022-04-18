const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const RestaurantRoutes = require("./routes/restaurant");
const ClientRoutes = require("./routes/client");

const MONGODB_URI = ``;

const app = express();

app.use(bodyParser.json()); //application/json

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/api", RestaurantRoutes);
app.use("/api", ClientRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({
    message: message,
    data: data,
  });
});

mongoose
  .connect(MONGODB_URI)

  // useNewUrlParser: true,
  // useUnifiedTopology: true,
  // auth: {authSource: "admin"},

  .then((result) => {
    // https
    //   .createServer({ key: privateKey, cert: certificate }, app)
    //   .listen(process.env.PORT || 8080);
    app.listen(process.env.PORT || 8080);
  })
  .catch((err) => console.log(err));
