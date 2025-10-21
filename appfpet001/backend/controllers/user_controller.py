from __future__ import annotations

from typing import Any, Dict, List, Optional

from ..models import UserModel


class UserController:
    """Business logic for user operations."""

    @staticmethod
    def list_users() -> List[Dict[str, Any]]:
        return UserModel.list_all()

    @staticmethod
    def get_user(user_id: int) -> Optional[Dict[str, Any]]:
        return UserModel.get_by_id(user_id)

    @staticmethod
    def create_user(payload: Dict[str, Any]) -> Dict[str, Any]:
        return UserModel.create(payload)

    @staticmethod
    def update_user(user_id: int, payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        return UserModel.update(user_id, payload)

    @staticmethod
    def delete_user(user_id: int) -> bool:
        return UserModel.delete(user_id)

    @staticmethod
    def authenticate(login: str, senha: str) -> Optional[Dict[str, Any]]:
        user = UserModel.get_by_login(login)
        if user and user.get("senha") == senha:
            return user
        return None

