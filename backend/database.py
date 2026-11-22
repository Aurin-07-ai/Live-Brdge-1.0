import os, sqlite3, json, uuid
from datetime import datetime, timezone

# SQLite lives in backend/database/healthbridge.db by default.
DB_PATH = os.getenv(
    "DATABASE_PATH",
    os.path.join(os.path.dirname(__file__), "database", "healthbridge.db"),
)

def _connect():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    with _connect() as conn:
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
    with _connect() as conn:
        conn.execute(
            "INSERT INTO sessions VALUES (?, ?, ?, ?, ?, ?)",
            (session_id, filename, language, source_text, json.dumps(care_plan, ensure_ascii=False), created_at)
        )
    return session_id

def get_session(session_id):
    with _connect() as conn:
        row = conn.execute("SELECT * FROM sessions WHERE id=?", (session_id,)).fetchone()
    if not row:
        return None
    return {
        "id": row["id"], "filename": row["filename"], "language": row["language"],
        "source_text": row["source_text"], "care_plan": json.loads(row["care_plan"])
    }
