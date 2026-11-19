
from pathlib import Path
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report

print("Loading dataset...", flush=True)

BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "dataset" / "processed_emails.csv"
MODEL_DIR = BASE_DIR / "models"
MODEL_FILE = MODEL_DIR / "phishing_model.joblib"

df = pd.read_csv(DATA_FILE, encoding="utf-8-sig")
df = df.dropna(subset=["Email Text", "Email Type"])

X = df["Email Text"].astype(str)
y = df["Email Type"].astype(str)

print("Total emails:", len(df), flush=True)

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("Training model. Please wait...", flush=True)

model = Pipeline([
    ("tfidf", TfidfVectorizer(
        lowercase=True,
        ngram_range=(1, 2),
        max_features=100000,
        sublinear_tf=True
    )),
    ("classifier", LogisticRegression(
        max_iter=1000,
        class_weight="balanced",
        random_state=42
    ))
])

model.fit(X_train, y_train)

predictions = model.predict(X_test)

print(
    "Test accuracy:",
    round(accuracy_score(y_test, predictions) * 100, 2),
    "%",
    flush=True
)

print(classification_report(y_test, predictions), flush=True)

MODEL_DIR.mkdir(parents=True, exist_ok=True)
joblib.dump(model, MODEL_FILE)

print("Model saved at:", MODEL_FILE, flush=True)
