import sqlite3
import threading

DB_FILE = 'data.db'
db_lock = threading.Lock()  # verrou global pour protéger les écritures

def with_db(write=False):
    class DBContext:
        def __enter__(self):
            if write:
                db_lock.acquire()
            self.conn = sqlite3.connect(DB_FILE, timeout=10)
            self.conn.execute("PRAGMA journal_mode=WAL;")
            return self.conn

        def __exit__(self, exc_type, exc_val, exc_tb):
            if self.conn:
                if exc_type is None and write:
                    self.conn.commit()
                self.conn.close()
            if write:
                db_lock.release()
            return False

    return DBContext()
