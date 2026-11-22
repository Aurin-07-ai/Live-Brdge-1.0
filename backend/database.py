import os, sqlite3, json, uuid
from contextlib import contextmanager
from datetime import datetime, timezone

# Production uses Neon PostgreSQL via DATABASE_URL. Local development falls back
# to the SQLite file at backend/database/healthbridge.db when DATABASE_URL is unset.
DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
USE_POSTGRES = DATABASE_URL.startswith(("postgres://", "postgresql://"))

DB_PATH = os.getenv(
    "DATABASE_PATH",
    os.path.join(os.path.dirname(__file__), "database", "healthbridge.db"),
)

PH = "%s" if USE_POSTGRES else "?"

if USE_POSTGRES:
    import psycopg
    from psycopg.rows import dict_row


def _connect():
    if USE_POSTGRES:
        return psycopg.connect(DATABASE_URL, row_factory=dict_row, connect_timeout=30)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


@contextmanager
def _db():
    """Commit on success, roll back on error, and always close the connection."""
    conn = _connect()
    try:
        with conn:
            yield conn
    finally:
        conn.close()


def init_db():
    if not USE_POSTGRES:
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    with _db() as conn:
        conn.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            filename TEXT NOT NULL,
            language TEXT NOT NULL,
            source_text TEXT NOT NULL,
            care_plan TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """)


def save_session(filename, language, source_text, care_plan):
    session_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()
    with _db() as conn:
        conn.execute(
            f"INSERT INTO sessions VALUES ({PH}, {PH}, {PH}, {PH}, {PH}, {PH})",
            (
                session_id,
                filename,
                language,
                source_text,
                json.dumps(care_plan, ensure_ascii=False),
                created_at,
            ),
        )
    return session_id


def get_session(session_id):
    with _db() as conn:
        row = conn.execute(
            f"SELECT * FROM sessions WHERE id={PH}", (session_id,)
        ).fetchone()
    if not row:
        return None
    return {
        "id": row["id"],
        "filename": row["filename"],
        "language": row["language"],
        "source_text": row["source_text"],
        "care_plan": json.loads(row["care_plan"]),
    }
