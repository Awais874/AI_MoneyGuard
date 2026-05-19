from pydantic import BaseModel
from datetime import datetime

class TransactionCreateSchema(BaseModel):
    amount: float
    transaction_type: str

class TransactionResponseSchema(BaseModel):
    id: int
    amount: float
    transaction_type: str
    is_fraud: bool
    created_at: datetime
    user_id: int

    class Config:
        from_attributes = True