from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


# ---- auth ----
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRead(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---- sessions ----
class SessionCreate(BaseModel):
    title: str
    code: str
    language: str = "javascript"
    detected_patterns: List[str] = []


class SessionRead(BaseModel):
    id: int
    title: str
    code: str
    language: str
    detected_patterns: str
    created_at: datetime


# ---- insights ----
class InsightRequest(BaseModel):
    code: str
    question: str
    # Optional context from the current trace step, so the model can
    # answer questions like "why did this variable change" precisely.
    current_line: Optional[int] = None
    scope_snapshot: Optional[dict] = None


class InsightResponse(BaseModel):
    answer: str
