import pandas as pd
import joblib
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

DATA_FILE = Path("dataset/combined_emails.csv")
MODEL_FILE = Path("models/phishing_model_v2.joblib")

if not DATA_FILE.exists():
    raise FileNotFoundError("combined_emails.csv nahi mili. Pehle combined dataset banao.")

df = pd.read_csv(DATA_FILE)
df = df.dropna(subset=["Email Text", "Email Type"])
df["Email Text"] = df["Email Text"].astype(str).str.strip()
df = df[df["Email Text"] != ""]

print("Dataset records:", len(df))
print("\nClass distribution:")
print(df["Email Type"].value_counts())

if df["Email Type"].nunique() != 2:
    raise ValueError("Dataset mein exactly 2 classes honi chahiye: Safe Email aur Phishing Email.")

X_train, X_test, y_train, y_test = train_test_split(
    df["Email Text"],
    df["Email Type"],
    test_size=0.20,
    random_state=42,
    stratify=df["Email Type"]
)

model = Pipeline([
    ("tfidf", TfidfVectorizer(
        max_features=10000,
        ngram_range=(1, 2),
        stop_words="english"
    )),
    ("classifier", LogisticRegression(
        max_iter=1000,
        class_weight="balanced"
    ))
])

print("\nTraining model...")
model.fit(X_train, y_train)

predictions = model.predict(X_test)

print("\nAccuracy:", round(accuracy_score(y_test, predictions) * 100, 2), "%")
print("\nClassification Report:")
print(classification_report(y_test, predictions))
print("\nConfusion Matrix:")
print(confusion_matrix(y_test, predictions))

MODEL_FILE.parent.mkdir(parents=True, exist_ok=True)
joblib.dump(model, MODEL_FILE)

print("\nNew model saved:", MODEL_FILE)
print("Old model remains unchanged.")
