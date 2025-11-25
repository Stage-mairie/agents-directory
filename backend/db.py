# backend/db.py
import mysql.connector
import threading

DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'root',
    'database': 'annuaire_agents',
    'autocommit': False
}

db_lock = threading.Lock()

def with_db(write=False):
    class DBContext:
        def __enter__(self):
            if write:
                db_lock.acquire()
            self.conn = mysql.connector.connect(**DB_CONFIG)
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
