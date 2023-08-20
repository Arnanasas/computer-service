const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 4050;

app.get("/", (req, res) => {
  res.send(`Hey it's working !!`);
});
app.listen(PORT, () => console.log(`server up and running at  ${PORT}`));

const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");

//IMPORT ROUTES
const authRoute = require("./routes/auth/auth");
const authDashboard = require("./routes/auth/authDashboard");

//ACCESSING THE ENVIRONMENT VARIABLES
dotenv.config();

//CONNECTION TO DATABASE
mongoose.connect(
    process.env.DB_CONNECT,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
  });

  

//MIDDLEWARE -> DISALBING CORS AND USED FOR JSON OUTPUT
app.use(express.json(), cors({
    origin: "http://127.0.0.1:5500", // Replace with your frontend's URL
    credentials: true, // Allow credentials (cookies)
}));

//ROUTE MIDDLEWARE
app.use(cookieParser());
app.use("/api/users", authRoute);
app.use("/api/dashboard", authDashboard);