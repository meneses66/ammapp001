const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000/api";

app.use(express.static(path.join(__dirname, "public")));

app.get("/config.js", (_req, res) => {
  res.type("application/javascript");
  res.send(`window.API_BASE_URL = ${JSON.stringify(API_BASE_URL)};`);
});

// Fallback routes for direct navigation
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/dashboard", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Frontend server running at http://localhost:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`Using API base URL: ${API_BASE_URL}`);
});
