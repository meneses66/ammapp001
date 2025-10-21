from __future__ import annotations

from flask import Blueprint, jsonify, request

from ..controllers import UserController


user_bp = Blueprint("users", __name__)


@user_bp.route("/users", methods=["GET"])
def list_users():
    users = UserController.list_users()
    return jsonify(users), 200


@user_bp.route("/users/<int:user_id>", methods=["GET"])
def get_user(user_id: int):
    user = UserController.get_user(user_id)
    if not user:
        return jsonify({"message": "Usuário não encontrado."}), 404
    return jsonify(user), 200


@user_bp.route("/users", methods=["POST"])
def create_user():
    payload = request.get_json(silent=True) or {}
    try:
        created = UserController.create_user(payload)
    except ValueError as exc:
        return jsonify({"message": str(exc)}), 400
    except Exception as exc:
        return jsonify({"message": f"Erro ao criar usuário: {exc}"}), 500
    return jsonify(created), 201


@user_bp.route("/users/<int:user_id>", methods=["PUT"])
def update_user(user_id: int):
    payload = request.get_json(silent=True) or {}
    updated = UserController.update_user(user_id, payload)
    if not updated:
        return jsonify({"message": "Usuário não encontrado."}), 404
    return jsonify(updated), 200


@user_bp.route("/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id: int):
    deleted = UserController.delete_user(user_id)
    if not deleted:
        return jsonify({"message": "Usuário não encontrado."}), 404
    return jsonify({"message": "Usuário excluído com sucesso."}), 200

