
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const Tesseract = require("tesseract.js");
const path = require("path");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const ML_URL = "http://127.0.0.1:5001";

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ================= SCAN MODEL =================

const scanSchema = new mongoose.Schema({
  scanType: { type: String, default: "Email" },
  inputText: { type: String, required: true },
  sender: { type: String, default: "" },
  subject: { type: String, default: "" },
  prediction: String,
  verdict: String,
  confidence: Number,
  message: String,
  riskLevel: String
}, { timestamps: true });

const Scan =
  mongoose.models.Scan || mongoose.model("Scan", scanSchema);

// ================= USER MODEL =================

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    default: ""
  },
  password: {
    type: String,
    required: true
  }
}, { timestamps: true });

const User =
  mongoose.models.User || mongoose.model("User", userSchema);

// ================= JWT =================

const createToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET || "document-scam-detector-secret",
    { expiresIn: "7d" }
  );
};

// ================= AUTH REGISTER =================

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Name, email and password are required."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: "Password must contain at least 8 characters."
      });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        error: "MongoDB is not connected."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        error: "This email is already registered. Please login."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: normalizedEmail,
      phone: phone || "",
      password: hashedPassword
    });

    const token = createToken(user);

    return res.status(201).json({
      success: true,
      message: "Account created successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error("Registration error:", error.message);

    return res.status(500).json({
      error: "Unable to create account. Please try again."
    });
  }
});

// ================= AUTH LOGIN =================

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required."
      });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        error: "MongoDB is not connected."
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password."
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid email or password."
      });
    }

    const token = createToken(user);

    return res.json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      error: "Unable to login. Please try again."
    });
  }
});

// ================= ML HEALTH =================

app.get("/api/ml/health", async (req, res) => {
  try {
    const response = await fetch(`${ML_URL}/health`);
    const data = await response.json();

    return res.status(response.status).json(data);

  } catch (error) {
    return res.status(503).json({
      error: "Python ML service is not running."
    });
  }
});

// ================= COMMON ML ANALYSIS =================

async function analyzeText(req, res) {
  try {
    const {
      text,
      sender,
      subject,
      scanType
    } = req.body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        error: "Please enter message text."
      });
    }

    const cleanText = text.trim();

    const mlResponse = await fetch(`${ML_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: cleanText
      })
    });

    const result = await mlResponse.json();

    if (!mlResponse.ok) {
      return res.status(mlResponse.status).json(result);
    }

    let riskLevel = "Low";

    if (result.prediction === "Phishing Email") {
      riskLevel =
        Number(result.confidence) >= 80
          ? "High"
          : "Medium";
    }

    const allowedTypes = [
      "Email",
      "Text",
      "SMS",
      "WhatsApp"
    ];

    const normalizedType = allowedTypes.includes(scanType)
      ? scanType
      : "Email";

    let savedScan = null;

    if (mongoose.connection.readyState === 1) {
      savedScan = await Scan.create({
        scanType: normalizedType,
        inputText: cleanText,
        sender: sender || "",
        subject: subject || "",
        prediction: result.prediction,
        verdict: result.verdict,
        confidence: result.confidence,
        message: result.message,
        riskLevel
      });
    }

    return res.json({
      ...result,
      riskLevel,
      scanType: normalizedType,
      scanId: savedScan ? savedScan._id : null,
      saved: Boolean(savedScan),
      modelNote:
        "This analysis uses a machine-learning model primarily trained on phishing email data. Results for SMS, WhatsApp and general text should be treated as indicative, not definitive."
    });

  } catch (error) {
    console.error("Text scan error:", error.message);

    return res.status(500).json({
      error: "Unable to analyze message. Check whether the ML service is running."
    });
  }
}

// ================= TEXT SCAN ROUTES =================

app.post("/api/scan/email", analyzeText);
app.post("/api/scan/text", analyzeText);
app.post("/api/scan/sms", analyzeText);
app.post("/api/scan/whatsapp", analyzeText);

// ================= URL SCAN =================

app.post("/api/scan/url", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== "string") {
      return res.status(400).json({
        error: "Please enter a valid website URL."
      });
    }

    let parsedUrl;

    try {
      parsedUrl = new URL(url.trim());
    } catch {
      return res.status(400).json({
        error: "Invalid URL format."
      });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return res.status(400).json({
        error: "Only HTTP and HTTPS URLs are supported."
      });
    }

    const hostname = parsedUrl.hostname.toLowerCase();

    const suspiciousReasons = [];

    if (parsedUrl.protocol !== "https:") {
      suspiciousReasons.push("Website does not use HTTPS.");
    }

    if (hostname.startsWith("xn--") || hostname.includes(".xn--")) {
      suspiciousReasons.push("Website uses an internationalized domain name.");
    }

    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
      suspiciousReasons.push("Website uses an IP address instead of a domain name.");
    }

    if (hostname.split(".").length > 4) {
      suspiciousReasons.push("Website has an unusually long subdomain structure.");
    }

    const suspiciousWords = [
      "login",
      "verify",
      "update",
      "secure",
      "account",
      "banking",
      "free",
      "reward",
      "prize"
    ];

    if (suspiciousWords.some(word => hostname.includes(word))) {
      suspiciousReasons.push("Domain contains words commonly used in deceptive links.");
    }

    const isSuspicious = suspiciousReasons.length > 0;

    const prediction = isSuspicious
      ? "Suspicious URL"
      : "No obvious URL warning detected";

    const riskLevel = isSuspicious ? "Medium" : "Low";

    let savedScan = null;

    if (mongoose.connection.readyState === 1) {
      savedScan = await Scan.create({
        scanType: "URL",
        inputText: url.trim(),
        prediction,
        verdict: prediction,
        confidence: null,
        message: suspiciousReasons.join(" ") ||
          "No basic URL warning was detected. This does not prove the website is safe.",
        riskLevel
      });
    }

    return res.json({
      success: true,
      scanType: "URL",
      prediction,
      verdict: prediction,
      riskLevel,
      confidence: null,
      reasons: suspiciousReasons,
      message: suspiciousReasons.join(" ") ||
        "No basic URL warning was detected. This does not prove the website is safe.",
      scanId: savedScan ? savedScan._id : null,
      saved: Boolean(savedScan),
      modelNote: "This is a basic URL heuristic check, not a reputation or malware database scan."
    });

  } catch (error) {
    console.error("URL scan error:", error.message);

    return res.status(500).json({
      error: "Unable to analyze URL."
    });
  }
});

// ================= IMAGE OCR UPLOAD =================

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (allowedTypes.includes(file.mimetype)) {
      return cb(null, true);
    }

    cb(new Error("Only JPG, PNG and WEBP images are allowed."));
  }
});

app.post("/api/scan/image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "Please upload an image."
      });
    }

    const ocrResult = await Tesseract.recognize(
      req.file.buffer,
      "eng"
    );

    const extractedText = ocrResult.data.text.trim();

    if (!extractedText) {
      return res.status(400).json({
        error: "No readable text found in the image."
      });
    }

    const mlResponse = await fetch(`${ML_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: extractedText
      })
    });

    const result = await mlResponse.json();

    if (!mlResponse.ok) {
      return res.status(mlResponse.status).json(result);
    }

    let riskLevel = "Low";

    if (result.prediction === "Phishing Email") {
      riskLevel =
        Number(result.confidence) >= 80
          ? "High"
          : "Medium";
    }

    let savedScan = null;

    if (mongoose.connection.readyState === 1) {
      savedScan = await Scan.create({
        scanType: "Image",
        inputText: extractedText,
        prediction: result.prediction,
        verdict: result.verdict,
        confidence: result.confidence,
        message: result.message,
        riskLevel
      });
    }

    return res.json({
      ...result,
      scanType: "Image",
      extractedText,
      riskLevel,
      scanId: savedScan ? savedScan._id : null,
      saved: Boolean(savedScan),
      modelNote: "Text was extracted from the image using OCR and analyzed by the email-trained ML model."
    });

  } catch (error) {
    console.error("Image scan error:", error.message);

    return res.status(500).json({
      error: error.message || "Unable to analyze image."
    });
  }
});

// ================= SCAN HISTORY =================

app.get("/api/scan/history", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        error: "MongoDB is not connected."
      });
    }

    const history = await Scan.find()
      .sort({ createdAt: -1 })
      .limit(100);

    return res.json(history);

  } catch (error) {
    console.error("History error:", error.message);

    return res.status(500).json({
      error: "Unable to load scan history."
    });
  }
});

// ================= API 404 HANDLER =================
// IMPORTANT: Keep this AFTER all API routes.

app.use("/api", (req, res) => {
  return res.status(404).json({
    success: false,
    error: "API route not found."
  });
});

// ================= GENERAL ERROR HANDLER =================

app.use((error, req, res, next) => {
  console.error("Server error:", error.message);

  return res.status(400).json({
    error: error.message || "Something went wrong."
  });
});

// ================= HOME =================

app.get("/", (req, res) => {
  res.send("Document Scam Detector Backend is Running!");
});

// ================= START SERVER =================

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
