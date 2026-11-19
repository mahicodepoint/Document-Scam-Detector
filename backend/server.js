const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

require("dotenv").config();

const app = express();
const PORT = 5000;
const ML_URL = "http://127.0.0.1:5001";

app.use(cors());
app.use(express.json());

const scanSchema = new mongoose.Schema({
  scanType: { type: String, default: "Email" },
  inputText: { type: String, required: true },
  prediction: String,
  verdict: String,
  confidence: Number,
  message: String,
  riskLevel: String
}, { timestamps: true });

const Scan = mongoose.models.Scan || mongoose.model("Scan", scanSchema);

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
    const { text, sender, subject } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Please enter message text." });
    }

    const mlResponse = await fetch(`${ML_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    const result = await mlResponse.json();

    if (!mlResponse.ok) {
      return res.status(mlResponse.status).json(result);
    }

    let riskLevel = "Low";
    if (result.prediction === "Phishing Email") {
      riskLevel = result.confidence >= 80 ? "High" : "Medium";
    }

    let savedScan = null;

    if (mongoose.connection.readyState === 1) {
      savedScan = await Scan.create({
        scanType: "Email",
        inputText: text,
        sender: sender || "",
        subject: subject || "",
        prediction: result.prediction,
        verdict: result.verdict,
        confidence: result.confidence,
        message: result.message,
        riskLevel
      });
    }

    res.json({
      ...result,
      riskLevel,
      scanId: savedScan ? savedScan._id : null,
      saved: Boolean(savedScan)
    });

  } catch (error) {
    console.error("Scan error:", error.message);
    res.status(500).json({ error: "Unable to analyze message." });
  }
});

app.get("/api/scan/history", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: "MongoDB is not connected." });
    }

    const history = await Scan.find().sort({ createdAt: -1 }).limit(100);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  if (process.env.MONGO_URI) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("MongoDB connected successfully.");
    } catch (error) {
      console.error("MongoDB connection failed:", error.message);
    }
  } else {
    console.log("MONGO_URI not configured. Scan history will not be saved.");
  }

  app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
  });
}

startServer();
