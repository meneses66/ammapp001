from __future__ import annotations

from flask import Blueprint, jsonify, request

from ..controllers import UserController


auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/auth/login", methods=["POST"])
def login():
    payload = request.get_json(silent=True) or {}
    login_value = payload.get("login")
    senha_value = payload.get("senha")

    if not login_value or not senha_value:
        return jsonify({"message": "Login and senha are required."}), 400

    user = UserController.authenticate(login_value, senha_value)
    if not user:
        return jsonify({"message": "Login e senha não conferem."}), 401

    # Avoid leaking password in response
    user.pop("senha", None)
    return jsonify({"message": "Autenticação realizada com sucesso.", "user": user}), 200

