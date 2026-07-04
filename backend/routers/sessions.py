from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from database import get_session
from models import ExecutionSession, User
from routers.auth import get_current_user
from schemas import SessionCreate, SessionRead

router = APIRouter()


@router.post("", response_model=SessionRead, status_code=status.HTTP_201_CREATED)
def save_session(
    payload: SessionCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    record = ExecutionSession(
        user_id=current_user.id,
        title=payload.title,
        code=payload.code,
        language=payload.language,
        detected_patterns=",".join(payload.detected_patterns),
    )
    session.add(record)
    session.commit()
    session.refresh(record)
    return record


@router.get("", response_model=List[SessionRead])
def list_sessions(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    return session.exec(
        select(ExecutionSession).where(ExecutionSession.user_id == current_user.id)
    ).all()


@router.get("/{session_id}", response_model=SessionRead)
def get_session_by_id(
    session_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    record = session.get(ExecutionSession, session_id)
    if not record or record.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Session not found")
    return record


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    record = session.get(ExecutionSession, session_id)
    if not record or record.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Session not found")
    session.delete(record)
    session.commit()
