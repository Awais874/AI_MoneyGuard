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


def predict_fraud(amount: float, transaction_type: str) -> bool:
    mapped_type = TYPE_MAP.get(transaction_type.lower(), 'PAYMENT')
    
    if mapped_type not in ['TRANSFER', 'CASH_OUT']:
        return False
    
    try:
        type_encoded = label_encoder.transform([mapped_type])[0]
    except:
        return False

    import pandas as pd
    features = pd.DataFrame([[
        amount,         # amount
        type_encoded,   # type
        amount,         # oldbalanceOrg — had exactly this amount
        0.0,            # newbalanceOrig — now completely drained
        0.0,            # oldbalanceDest — destination was empty
        0.0             # newbalanceDest — money disappeared!
    ]], columns=['amount', 'type_encoded', 'oldbalanceOrg', 'newbalanceOrig', 'oldbalanceDest', 'newbalanceDest'])
    
    proba = model.predict_proba(features)[0][1]
    print(f"Fraud probability: {proba}")
    return bool(proba > 0.3)



@router.post("/", response_model=TransactionResponseSchema, status_code=201)
def create_transaction(data: TransactionCreateSchema, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
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
    import pandas as pd
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

        features = pd.DataFrame([[
            amount, type_encoded, amount, 0.0, 0.0, 0.0
        ]], columns=['amount', 'type_encoded', 'oldbalanceOrg', 'newbalanceOrig', 'oldbalanceDest', 'newbalanceDest'])

        proba = round(float(model.predict_proba(features)[0][1]), 2)

        importances = model.feature_importances_
        feature_names = ['amount', 'type_encoded', 'oldbalanceOrg', 'newbalanceOrig', 'oldbalanceDest', 'newbalanceDest']
        ranked = sorted(zip(feature_names, importances), key=lambda x: x[1], reverse=True)

        explanations = {
            'newbalanceOrig':  f"Sender's balance dropped to $0 after sending ${amount:,.2f} — full account drain is the strongest fraud signal",
            'oldbalanceOrg':   f"Sender had exactly ${amount:,.2f} before the transaction — entire balance was moved",
            'amount':          f"Transaction amount of ${amount:,.2f} is large enough to trigger the fraud model",
            'type_encoded':    f"Transaction type '{transaction.transaction_type}' is one of the highest-risk types",
            'oldbalanceDest':  "Receiver's account had $0 before receiving — typical in fraudulent chain transfers",
            'newbalanceDest':  "Receiver's balance stayed at $0 after transfer — money likely moved immediately",
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