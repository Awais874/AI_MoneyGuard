from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.transaction import Transaction
from schemas.transaction_schema import TransactionCreateSchema, TransactionResponseSchema
from utils.auth_utils import get_current_user
from models.user import User
from typing import List

router = APIRouter()

@router.post("/", response_model=TransactionResponseSchema, status_code=201)
def create_transaction(data: TransactionCreateSchema, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    is_fraud = data.amount > 10000
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


@router.delete("/{transaction_id}", status_code=204)
def delete_transaction(transaction_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id, Transaction.user_id == current_user.id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    db.delete(transaction)
    db.commit()