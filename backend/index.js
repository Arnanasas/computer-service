const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");

//IMPORT ROUTES
const authRoute = require("./routes/auth/auth");
const authDashboard = require("./routes/auth/authDashboard");

//ACCESSING THE ENVIRONMENT VARIABLES
dotenv.config();

//CONNECTION TO DATABASE
mongoose
  .connect(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
  });

const app = express();

//MIDDLEWARE -> DISALBING CORS AND USED FOR JSON OUTPUT
app.use(
  express.json(),
  cors({
    origin: "http://localhost:3000", // Replace with your frontend's URL
    credentials: true, // Allow credentials (cookies)
  })
);

//ROUTE MIDDLEWARE
app.use(cookieParser());
app.use("/api/users", authRoute);
app.use("/api/dashboard", authDashboard);

const server = http.createServer(app); // Create an HTTP server instance
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("new-comment", () => {
    // Notify all other users except the sender
    socket.broadcast.emit("receive-notification");
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

const PORT = process.env.PORT || 4050;
server.listen(PORT, () => console.log(`Server up and running at ${PORT}`));
