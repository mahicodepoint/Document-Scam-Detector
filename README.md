# 🔐 Document Scam Detector

An AI-powered web application designed to help users identify potentially fraudulent documents, messages, emails, websites, and recruitment/job-related scam content.

## 🚀 Project Overview

**Document Scam Detector** is a MERN-stack based scam detection system that analyzes suspicious content and provides users with a risk assessment and recommendations.

The system is designed to help users identify common scam indicators before taking actions such as sharing personal information, making payments, or responding to suspicious offers.

## ✨ Features

* 📄 Document scam detection
* 📧 Email content and sender analysis
* 💬 Message/SMS/WhatsApp scam analysis
* 🌐 Suspicious URL/website checking
* 🖼️ Screenshot/image-based scam detection
* 💳 Payment and job/recruitment scam detection
* 🤖 AI-assisted analysis
* 📊 Scam risk assessment
* 🛡️ Safety recommendations
* 📜 Scan history
* 👀 Watchlist
* 📈 Reports and dashboard
* 🔐 User authentication
* 🗄️ MongoDB database

## 🛠️ Technology Stack

### Frontend

* React.js
* Vite
* JavaScript
* CSS
* React Router

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* REST API

### AI

The project is designed to integrate an external AI API for analyzing suspicious scam-related content.

## 📁 Project Structure

```text
Document-Scam-Detector/
│
├── backend/
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/mahicodepoint/Document-Scam-Detector.git
```

```bash
cd Document-Scam-Detector
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

### 3. Install backend dependencies

Open another terminal:

```bash
cd backend
npm install
```

### 4. Configure environment variables

Create a `.env` file inside the `backend` folder.

Example:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/scamshield
JWT_SECRET=your_secret_key
AI_API_KEY=your_ai_api_key
```

**Never upload your real `.env` file or API keys to GitHub.**

## ▶️ Run the Project

### Start Backend

```bash
cd backend
npm run dev
```

Backend:

```text
http://localhost:5000
```

### Start Frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## 🔍 How It Works

```text
User Input
    ↓
Document / Email / Message / URL / Image
    ↓
Backend API
    ↓
Content Processing
    ↓
AI Analysis
    ↓
Scam Risk Assessment
    ↓
Result + Safety Recommendations
```

## 🎯 Main Objective

The main objective of this project is to provide a simple and accessible platform that can help users recognize potential scam indicators in digital content.

The system is intended as an **assistance and awareness tool** and should not be treated as a guaranteed determination that content is fraudulent.

## 🔮 Future Enhancements

* Advanced AI classification
* OCR for scanned documents
* Real-time URL reputation checking
* Email header analysis
* Multilingual scam detection
* Browser extension
* Mobile application
* Improved scam database
* Real-time threat intelligence integration

## 👩‍💻 Developer

**Mahima Yadav**

GitHub: [mahicodepoint](https://github.com/mahicodepoint)

## 📄 License

This project is developed for educational and project purposes.
