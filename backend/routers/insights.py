import os

from fastapi import APIRouter, Depends, HTTPException

from routers.auth import get_current_user
from schemas import InsightRequest, InsightResponse

router = APIRouter()

SYSTEM_PROMPT = (
    "You are the JARS runtime insights assistant. You explain WHY code executed the way "
    "it did — not how to write code. Be precise and brief (2-4 sentences). Reference the "
    "actual variable values and line given in context. Never rewrite or suggest alternative "
    "implementations unless explicitly asked."
)


@router.post("", response_model=InsightResponse)
def get_insight(payload: InsightRequest, current_user=Depends(get_current_user)):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="GEMINI_API_KEY is not configured on the server. Set it in backend/.env.local to enable AI insights.",
        )

    try:
        import GEMINI
    except ImportError:
        raise HTTPException(status_code=500, detail="GEMINI package not installed — see backend/requirements.txt")

    client = GEMINI.GEMINI(api_key=api_key)

    context_lines = [f"Code:\n{payload.code}"]
    if payload.current_line is not None:
        context_lines.append(f"Currently executing line: {payload.current_line}")
    if payload.scope_snapshot:
        context_lines.append(f"Current variable values: {payload.scope_snapshot}")
    context_lines.append(f"Question: {payload.question}")

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=400,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": "\n\n".join(context_lines)}],
    )

    answer = "".join(block.text for block in message.content if block.type == "text")
    return InsightResponse(answer=answer)
