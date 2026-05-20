import pandas as pd

df = pd.read_csv('ml/PS_20174392719_1491204439457_log.csv')

print("Shape:", df.shape)
print("\nColumns:", df.columns.tolist())
print("\nFirst 5 rows:")
print(df.head())
print("\nFraud distribution:")
print(df['isFraud'].value_counts())
print("\nTransaction types:")
print(df['type'].value_counts())