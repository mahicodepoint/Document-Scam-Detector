
from pathlib import Path

import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS

BASE_DIR = Path(__file__).resolve().parent
MODEL_FILE = BASE_DIR / "models" / "phishing_model.joblib"

app = Flask(__name__)
CORS(app)

model = None


def load_model():
    global model

    if MODEL_FILE.exists():
        model = joblib.load(MODEL_FILE)
        print("ML model loaded successfully.")
    else:
        print("Model not found. Run: python train_model.py")


@app.get("/health")
def health():
    return jsonify({
        "status": "ok",
        "model_loaded": model is not None
    })


@app.post("/predict")
def predict():
    if model is None:
        return jsonify({
            "error": "ML model not loaded. Train the model first."
        }), 503

    data = request.get_json(silent=True) or {}
    email_text = data.get("text", "")

    if not isinstance(email_text, str) or not email_text.strip():
        return jsonify({
            "error": "Please provide email text."
        }), 400

    prediction = model.predict([email_text.strip()])[0]
    probabilities = model.predict_proba([email_text.strip()])[0]
    classes = list(model.classes_)
    confidence = float(probabilities[classes.index(prediction)]) * 100

    return jsonify({
        "prediction": str(prediction),
        "confidence": round(confidence, 2),
        "message": (
            "Potential phishing email detected."
            if prediction == "Phishing Email"
            else "Email classified as likely safe."
        )
    })


if __name__ == "__main__":
    load_model()
    app.run(host="127.0.0.1", port=5001, debug=False)
