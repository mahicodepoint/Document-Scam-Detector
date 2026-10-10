import csv
import sys
from pathlib import Path
import pandas as pd

csv.field_size_limit(sys.maxsize)

BASE_DIR = Path(__file__).resolve().parent
INPUT_FILE = BASE_DIR / "dataset" / "Phishing_Email.csv"
OUTPUT_FILE = BASE_DIR / "dataset" / "processed_emails.csv"

print("Loading dataset...")

df = pd.read_csv(
    INPUT_FILE,
    encoding="utf-8-sig",
    encoding_errors="replace",
    low_memory=False
)

# Remove unnecessary index column
df = df.loc[:, ~df.columns.astype(str).str.match(r"^Unnamed")]

# Keep required columns
df = df[["Email Text", "Email Type"]].copy()

# Clean text and labels
df["Email Text"] = df["Email Text"].fillna("").astype(str).str.strip()
df["Email Type"] = df["Email Type"].fillna("").astype(str).str.strip().str.lower()

# Standardize labels
df["Email Type"] = df["Email Type"].map({
    "safe email": "Safe Email",
    "phishing email": "Phishing Email"
})

# Remove empty emails and invalid labels
df = df[df["Email Text"].ne("") & df["Email Type"].notna()]

before = len(df)

# Remove duplicate emails
df = df.drop_duplicates(subset=["Email Text"], keep="first")

# Save cleaned dataset
df.to_csv(OUTPUT_FILE, index=False, encoding="utf-8-sig")

print("\nPreprocessing complete!")
print("Rows before duplicate removal:", before)
print("Rows after cleaning:", len(df))
print("Duplicates removed:", before - len(df))
print("\nLabel counts:")
print(df["Email Type"].value_counts())
print("\nSaved file:", OUTPUT_FILE)