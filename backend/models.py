from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ExecutionSession(SQLModel, table=True):
    """A saved visualization: the source code plus metadata, so a user can
    reopen and replay it later. The trace itself is regenerated client-side
    by re-running the interpreter on `code` — only the code + settings need
    to be persisted."""

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    title: str
    code: str
    language: str = Field(default="javascript")
    detected_patterns: str = Field(default="")  # comma-separated, denormalized for quick listing
    created_at: datetime = Field(default_factory=datetime.utcnow)
