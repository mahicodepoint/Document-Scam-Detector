
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;
const ML_URL = "http://127.0.0.1:5001";

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Document Scam Detector Backend is Running!");
});

app.get("/api/ml/health", async (req, res) => {
  try {
    const response = await fetch(`${ML_URL}/health`);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(503).json({ error: "Python ML service is not running." });
  }
});

app.post("/api/scan/email", async (req, res) => {
  try {
    const { text } = req.body || {};

    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Please enter email text." });
    }

    const response = await fetch(`${ML_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.trim() })
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(503).json({
      error: "Could not connect to the Python ML service."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
