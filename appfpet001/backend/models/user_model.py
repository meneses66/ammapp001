from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from ..database import get_cursor


class UserModel:
    """Data access layer for `tbusuarios` table."""

    TABLE = "tbusuarios"
    FIELDS = [
        "iduser",
        "usuario",
        "login",
        "senha",
        "perfil",
        "fone",
        "data_criado",
    ]

    @staticmethod
    def list_all() -> List[Dict[str, Any]]:
        with get_cursor() as cursor:
            cursor.execute(
                f"SELECT {', '.join(UserModel.FIELDS)} FROM {UserModel.TABLE} ORDER BY iduser"
            )
            return cursor.fetchall()

    @staticmethod
    def get_by_id(user_id: int) -> Optional[Dict[str, Any]]:
        with get_cursor() as cursor:
            cursor.execute(
                f"SELECT {', '.join(UserModel.FIELDS)} FROM {UserModel.TABLE} WHERE iduser = %s",
                (user_id,),
            )
            return cursor.fetchone()

    @staticmethod
    def get_by_login(login: str) -> Optional[Dict[str, Any]]:
        with get_cursor() as cursor:
            cursor.execute(
                f"SELECT {', '.join(UserModel.FIELDS)} FROM {UserModel.TABLE} WHERE login = %s",
                (login,),
            )
            return cursor.fetchone()

    @staticmethod
    def create(payload: Dict[str, Any]) -> Dict[str, Any]:
        data = payload.copy()
        data.setdefault("data_criado", datetime.utcnow())

        missing = [field for field in ("iduser", "usuario", "login", "senha", "perfil") if field not in data]
        if missing:
            raise ValueError(f"Missing required fields: {', '.join(missing)}")

        columns = []
        values = []
        placeholders = []
        for field in UserModel.FIELDS:
            if field in data and data[field] is not None:
                columns.append(field)
                values.append(data[field])
                placeholders.append("%s")

        with get_cursor(commit=True) as cursor:
            cursor.execute(
                f"INSERT INTO {UserModel.TABLE} ({', '.join(columns)}) VALUES ({', '.join(placeholders)})",
                values,
            )

        return UserModel.get_by_id(int(data["iduser"])) or {}

    @staticmethod
    def update(user_id: int, payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        allowed_fields = [field for field in UserModel.FIELDS if field != "iduser"]
        new_id = payload.get("iduser", user_id)
        assignments = []
        values = []
        for field in allowed_fields:
            if field in payload:
                assignments.append(f"{field} = %s")
                values.append(payload[field])
        if "iduser" in payload:
            assignments.insert(0, "iduser = %s")
            values.insert(0, payload["iduser"])

        if not assignments:
            return UserModel.get_by_id(user_id)

        values.append(user_id)
        with get_cursor(commit=True) as cursor:
            cursor.execute(
                f"UPDATE {UserModel.TABLE} SET {', '.join(assignments)} WHERE iduser = %s",
                values,
            )

        return UserModel.get_by_id(int(new_id))

    @staticmethod
    def delete(user_id: int) -> bool:
        with get_cursor(commit=True) as cursor:
            cursor.execute(f"DELETE FROM {UserModel.TABLE} WHERE iduser = %s", (user_id,))
            return cursor.rowcount > 0
