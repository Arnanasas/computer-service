const express = require("express");
const path = require("path");
const app = express();
const PORT = 8080;

// Serve static assets from the 'build' directory
app.use(express.static(path.join(__dirname, "build")));

// Serve index.html for all routes to enable HTML5 mode
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Frontend app is running on port ${PORT}`);
});
