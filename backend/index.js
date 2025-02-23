const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const { rateLimit } = require("express-rate-limit");

//IMPORT ROUTES
const authRoute = require("./routes/auth/auth");
const authDashboard = require("./routes/auth/authDashboard");
const messageRoute = require("./routes/message");
const signatureRoute = require("./routes/sign");

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
    origin: ["https://admin.it112.lt", "https://it112.lt", "*"], // Replace with your frontend's URL
    credentials: true, // Allow credentials (cookies)
  })
);

// Limiter

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 50, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
});

//ROUTE MIDDLEWARE
app.use(cookieParser());
app.use("/api/users", authRoute);
app.use("/api/dashboard", authDashboard);
app.use("/api/send-msg", messageRoute);
app.use("/api/signature", signatureRoute);
app.use(limiter);

const server = http.createServer(app); // Create an HTTP server instance
const io = new Server(server, {
  cors: {
    origin: "https://admin.it112.lt",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("new-comment", () => {
    // Notify all other users except the sender
    socket.broadcast.emit("receive-notification");
  });

  socket.on("register-tablet", (nickname) => {
    if (nickname === "tablet") {
      socket.join("tablet-room");
      console.log("Tablet user joined the room");
    }
  });

  // Emit a signature capture request to the tablet user
  socket.on("request-signature", (data) => {
    const { serviceID } = data;
    io.to("tablet-room").emit("capture-signature", {
      link: `/capture-signature/${serviceID}`,
    });
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

const PORT = process.env.PORT || 4050;
server.listen(PORT, () => console.log(`Server up and running at ${PORT}`));
