from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os

app = Flask(__name__)
CORS(app)

MODEL_FILE = "models/phishing_model_v2.joblib"
model = None

try:
    if os.path.exists(MODEL_FILE):
        model = joblib.load(MODEL_FILE)
        print("New ML model loaded successfully!")
    else:
        print("New model not found. Train it first.")
except Exception as e:
    print("Model loading error:", str(e))

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok" if model is not None else "error",
        "model_loaded": model is not None
    }), 200 if model is not None else 503

@app.route("/predict", methods=["POST"])
def predict():
    if model is None:
        return jsonify({"error": "ML model is not loaded"}), 503

    data = request.get_json(silent=True) or {}
    text = str(data.get("text", "")).strip()

    if not text:
        return jsonify({"error": "Please provide message text"}), 400

    try:
        prediction = model.predict([text])[0]
        probabilities = model.predict_proba([text])[0]
        confidence = round(float(max(probabilities)) * 100, 2)

        is_phishing = prediction == "Phishing Email"

        return jsonify({
            "prediction": prediction,
            "verdict": "Potential Scam Detected" if is_phishing else "No Scam Indicators Detected",
            "confidence": confidence,
            "message": (
                "This message contains suspicious patterns. Verify the sender and do not share money, OTP or personal details."
                if is_phishing else
                "No strong phishing patterns were detected. Still verify the sender before taking action."
            )
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001, debug=False)
