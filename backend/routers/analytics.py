from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.transaction import Transaction
from utils.auth_utils import get_current_user
from models.user import User
import pandas as pd

router = APIRouter()

@router.get("/summary")
def get_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    transactions = db.query(Transaction).filter(Transaction.user_id == current_user.id).all()

    if not transactions:
        return {
            "total": 0,
            "fraud": 0,
            "clean": 0,
            "total_amount": 0,
            "fraud_amount": 0,
            "clean_amount": 0
        }

    df = pd.DataFrame([{
        "id": t.id,
        "amount": t.amount,
        "transaction_type": t.transaction_type,
        "is_fraud": t.is_fraud,
        "created_at": t.created_at
    } for t in transactions])

    return {
        "total": len(df),
        "fraud": int(df["is_fraud"].sum()),
        "clean": int((~df["is_fraud"]).sum()),
        "total_amount": float(df["amount"].sum()),
        "fraud_amount": float(df[df["is_fraud"]]["amount"].sum()),
        "clean_amount": float(df[~df["is_fraud"]]["amount"].sum())
    }


@router.get("/by-date")
def get_by_date(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    transactions = db.query(Transaction).filter(Transaction.user_id == current_user.id).all()

    if not transactions:
        return []

    df = pd.DataFrame([{
        "amount": t.amount,
        "is_fraud": t.is_fraud,
        "created_at": t.created_at
    } for t in transactions])

    df["date"] = pd.to_datetime(df["created_at"]).dt.date
    grouped = df.groupby("date").agg(
        total=("amount", "count"),
        fraud=("is_fraud", "sum")
    ).reset_index()

    return [
        {
            "date": str(row["date"]),
            "total": int(row["total"]),
            "fraud": int(row["fraud"])
        }
        for _, row in grouped.iterrows()
    ]