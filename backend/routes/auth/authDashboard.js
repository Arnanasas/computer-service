const User = require("../../models/User");
const verify = require("./authVerify");

const router = require("express").Router();

router.get("/allusers", verify, async (req, res) => {
  try {
    const results = await User.find().exec();
    res.send(results);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get('/me', verify, (req, res) => {
  // req.user contains the decoded user from the JWT token
  
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;