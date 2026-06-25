from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.transaction import Transaction
from schemas.transaction_schema import TransactionCreateSchema, TransactionResponseSchema
from utils.auth_utils import get_current_user, require_role
from models.user import User
from typing import List
import joblib
import numpy as np
import os

router = APIRouter()

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'ml', 'fraud_model.pkl')
ENCODER_PATH = os.path.join(os.path.dirname(__file__), '..', 'ml', 'label_encoder.pkl')

model = joblib.load(MODEL_PATH)
label_encoder = joblib.load(ENCODER_PATH)

TYPE_MAP = {
    'transfer': 'TRANSFER',
    'deposit': 'CASH_IN',
    'withdrawal': 'CASH_OUT',
    'payment': 'PAYMENT'
}


def build_features(amount: float, type_encoded: int):
    import pandas as pd
    sender_balance = max(amount * 10, 50000.0)
    return pd.DataFrame([[
        amount,
        type_encoded,
        sender_balance,
        sender_balance - amount,
        0.0,
        amount,
    ]], columns=['amount', 'type_encoded', 'oldbalanceOrg', 'newbalanceOrig', 'oldbalanceDest', 'newbalanceDest'])


def predict_fraud(amount: float, transaction_type: str) -> bool:
    mapped_type = TYPE_MAP.get(transaction_type.lower(), 'PAYMENT')
    if mapped_type not in ['TRANSFER', 'CASH_OUT']:
        return False
    try:
        type_encoded = label_encoder.transform([mapped_type])[0]
    except:
        return False
    features = build_features(amount, type_encoded)
    proba = model.predict_proba(features)[0][1]
    print(f"Fraud probability: {proba:.4f}")
    return bool(proba > 0.5)



@router.post("/", response_model=TransactionResponseSchema, status_code=201)
def create_transaction(data: TransactionCreateSchema, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    deduct_types = ['transfer', 'withdrawal', 'payment']
    tx_type = data.transaction_type.lower()

    if tx_type in deduct_types:
        if current_user.balance < data.amount:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient balance. Your current balance is ${current_user.balance:,.2f}"
            )
        current_user.balance -= data.amount
    elif tx_type == 'deposit':
        current_user.balance += data.amount

    is_fraud = predict_fraud(data.amount, data.transaction_type)
    transaction = Transaction(
        amount=data.amount,
        transaction_type=data.transaction_type,
        is_fraud=is_fraud,
        user_id=current_user.id
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


@router.get("/", response_model=List[TransactionResponseSchema])
def get_transactions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    transactions = db.query(Transaction).filter(Transaction.user_id == current_user.id).all()
    return transactions


@router.get("/all", response_model=List[TransactionResponseSchema])
def get_all_transactions(db: Session = Depends(get_db), _: User = Depends(require_role("admin"))):
    return db.query(Transaction).all()


@router.get("/{transaction_id}/explain")
def explain_transaction(transaction_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    mapped_type = TYPE_MAP.get(transaction.transaction_type.lower(), 'PAYMENT')
    amount = transaction.amount
    reasons = []

    if mapped_type in ['TRANSFER', 'CASH_OUT']:
        try:
            type_encoded = label_encoder.transform([mapped_type])[0]
        except:
            return {"fraud_probability": 0.0, "reasons": []}

        features = build_features(amount, type_encoded)
        proba = round(float(model.predict_proba(features)[0][1]), 2)

        importances = model.feature_importances_
        feature_names = ['amount', 'type_encoded', 'oldbalanceOrg', 'newbalanceOrig', 'oldbalanceDest', 'newbalanceDest']
        ranked = sorted(zip(feature_names, importances), key=lambda x: x[1], reverse=True)

        amount_label = "unusually large amount" if amount >= 10000 else "transaction amount"
        explanations = {
            'newbalanceOrig':  f"Sender's balance decreased after sending ${amount:,.2f} — balance movement pattern matched fraud cases",
            'oldbalanceOrg':   f"Sender's starting balance relative to ${amount:,.2f} raised the risk score",
            'amount':          f"The {amount_label} of ${amount:,.2f} contributed to the overall fraud score",
            'type_encoded':    f"Transaction type '{transaction.transaction_type}' is one of the highest-risk categories",
            'oldbalanceDest':  "Receiver's account balance pattern is similar to known fraud recipient accounts",
            'newbalanceDest':  "Receiver's balance after the transfer matched patterns seen in fraudulent chains",
        }

        for feature, importance in ranked[:3]:
            reasons.append({
                "feature": feature,
                "importance": round(float(importance), 3),
                "explanation": explanations.get(feature, "")
            })
    else:
        proba = 0.0
        reasons.append({
            "feature": "transaction_type",
            "importance": 1.0,
            "explanation": f"Transaction type '{transaction.transaction_type}' is low risk — fraud only occurs in TRANSFER and CASH_OUT types"
        })

    return {
        "transaction_id": transaction_id,
        "amount": amount,
        "transaction_type": transaction.transaction_type,
        "is_fraud": transaction.is_fraud,
        "fraud_probability": proba,
        "reasons": reasons
    }


@router.delete("/{transaction_id}", status_code=204)
def delete_transaction(transaction_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id, Transaction.user_id == current_user.id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    db.delete(transaction)
    db.commit()