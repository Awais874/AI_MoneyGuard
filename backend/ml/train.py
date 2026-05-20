import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.preprocessing import LabelEncoder
import joblib
import os

print("Loading dataset...")
df = pd.read_csv('ml/PS_20174392719_1491204439457_log.csv')

print("Preprocessing...")
df = df[df['type'].isin(['TRANSFER', 'CASH_OUT'])]

le = LabelEncoder()
df['type_encoded'] = le.fit_transform(df['type'])

features = ['amount', 'type_encoded', 'oldbalanceOrg', 'newbalanceOrig', 'oldbalanceDest', 'newbalanceDest']
target = 'isFraud'

X = df[features]
y = df[target]

print(f"Dataset size after filtering: {len(df)}")
print(f"Fraud cases: {y.sum()} ({y.mean()*100:.2f}%)")

print("Splitting data...")
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

print("Training Random Forest...")
model = RandomForestClassifier(
    n_estimators=100,
    max_depth=20,
    class_weight='balanced',
    random_state=42,
    n_jobs=-1
)
model.fit(X_train, y_train)

print("Evaluating model...")
y_pred = model.predict(X_test)
print("\nClassification Report:")
print(classification_report(y_test, y_pred))
print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))

print("\nFeature Importances:")
for feat, imp in zip(features, model.feature_importances_):
    print(f"  {feat}: {imp:.4f}")

os.makedirs('ml', exist_ok=True)
joblib.dump(model, 'ml/fraud_model.pkl')
joblib.dump(le, 'ml/label_encoder.pkl')
print("\nModel saved to ml/fraud_model.pkl")