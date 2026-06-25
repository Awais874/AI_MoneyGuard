from pydantic import BaseModel, EmailStr

class RegisterSchema(BaseModel):
    username: str
    email: EmailStr
    password: str

class LoginSchema(BaseModel):
    email: EmailStr
    password: str

class TokenSchema(BaseModel):
    access_token: str
    token_type: str

class UserResponseSchema(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str
    balance: float

    class Config:
        from_attributes = True


class UpdateRoleSchema(BaseModel):
    role: str