from __future__ import annotations

from contextlib import contextmanager
from typing import Iterator

import pymysql
from pymysql.cursors import DictCursor

from .config import Config


config = Config()


def get_connection() -> pymysql.Connection:
    """Create and return a new MySQL connection."""
    return pymysql.connect(
        host=config.DB_HOST,
        port=config.DB_PORT,
        user=config.DB_USER,
        password=config.DB_PASSWORD,
        database=config.DB_NAME,
        cursorclass=DictCursor,
        autocommit=config.DB_AUTOCOMMIT,
    )


@contextmanager
def get_cursor(commit: bool = False) -> Iterator[DictCursor]:
    """Context manager that yields a cursor and handles commit/rollback."""
    connection = get_connection()
    cursor = connection.cursor()
    try:
        yield cursor
        if commit and not config.DB_AUTOCOMMIT:
            connection.commit()
    except Exception:
        if not config.DB_AUTOCOMMIT:
            connection.rollback()
        raise
    finally:
        cursor.close()
        connection.close()

