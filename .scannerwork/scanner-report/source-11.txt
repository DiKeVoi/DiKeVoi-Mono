import contextlib
import io

import pytest
from fastapi import APIRouter
from fastapi.responses import PlainTextResponse

router = APIRouter()


@router.get("/health", tags=["health"])
def health_check() -> dict:
    return {"status": "ok"}


@router.get(
    "/health/tests",
    tags=["health"],
    response_class=PlainTextResponse,
    description="Run the test suite and return the results as plain text.",
)
def run_tests() -> str:
    buf = io.StringIO()
    with contextlib.redirect_stdout(buf), contextlib.redirect_stderr(buf):
        exit_code = pytest.main(["tests/", "-v", "--tb=short", "--no-header"])
    output = buf.getvalue()
    status = "PASSED" if exit_code == pytest.ExitCode.OK else "FAILED"
    return f"Exit status: {status}\n\n{output}"
