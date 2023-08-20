const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // const token = req.header("auth-token");
  // if (!token) return res.status(401).send("Access Denied");

  // try {
  //   const verified = jwt.verify(token, process.env.TOKEN_SECRET);
  //   req.user = verified;
  //   next();
  // } catch (error) {
  //   res.status(400).send("Invalid token");
  // }
  const fullCookieValue = req.cookies["auth-token"];
  if (!fullCookieValue) return res.status(401).send("Access Denied");

  // Extract the token part after "auth-token="
  const token = fullCookieValue;

  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).send("Invalid token");
  }
};