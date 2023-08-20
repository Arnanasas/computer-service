const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");

// VALIDATION OF USER INPUTS PREREQUISITES
const Joi = require("@hapi/joi");

const registerSchema = Joi.object({
  nickname: Joi.string().min(3).required(),
  email: Joi.string().min(6).required().email(),
  password: Joi.string().min(6).required(),
});

// SIGNUP USER
router.post("/register", async (req, res) => {
  // CHECKING IF USER EMAIL ALREADY EXISTS
  const emailExist = await User.findOne({ email: req.body.email });
  // IF EMAIL EXIST THEN RETURN
  if (emailExist) {
    res.status(400).send("Email already exists");
    return;
  }
  // ON PROCESS OF ADDING NEW USER

  const user = new User({
    nickname: req.body.nickname,
    email: req.body.email,
    password: req.body.password, // Store the plain password for now
  });

  try {
    // VALIDATION OF USER INPUTS

    const { error } = await registerSchema.validateAsync(req.body);
    // WE CAN JUST GET THE ERROR(IF EXISTS) WITH OBJECT DECONSTRUCTION

    // IF ERROR EXISTS THEN SEND BACK THE ERROR
    if (error) {
      res.status(400).send(error.details[0].message);
      return;
    } else {
      // NEW USER IS ADDED
      const hashedPassword = await bcrypt.hash(req.body.password, 10); // Hash the password

      user.password = hashedPassword; // Update the user's password with the hashed version
      const saveUser = await user.save();
      res.status(200).send("user created");
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

const loginSchema = Joi.object({
  email: Joi.string().min(6).required().email(),
  password: Joi.string().min(6).required(),
});

// LOGIN USER

router.post("/login", async (req, res) => {
  // ... (same code as before)
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Incorrect Email- ID");

  // CHECKING IF USER PASSWORD MATCHES

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Incorrect Password");

  try {
    // VALIDATION OF USER INPUTS

    const { error } = await loginSchema.validateAsync(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    else {

      // SENDING BACK THE TOKEN IN AN HTTPONLY COOKIE
      const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);

      res.cookie("auth-token", token, {
        httpOnly: true,
        // secure: true, // Only send the cookie over HTTPS
        maxAge: 3600000, // 1 hour in milliseconds
        sameSite: "strict", // Adjust as needed
        path: "/", // Adjust as needed
      });

      res.status(200).send(user.nickname);
    }
  } catch (error) {
    res.status(500).send(error);
  }
});


module.exports = router;
