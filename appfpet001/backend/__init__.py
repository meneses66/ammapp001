from flask import Flask, jsonify
from flask_cors import CORS

from .config import Config
from .routes.user_routes import user_bp
from .routes.auth_routes import auth_bp


def create_app(config_class: type[Config] | None = None) -> Flask:
    """Application factory for the backend API."""
    app = Flask(__name__)
    app.config.from_object(config_class or Config())

    # Enable CORS so the Node.js frontend can call the API.
    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})

    # Register blueprints under /api namespace
    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(user_bp, url_prefix="/api")

    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok"}), 200

    return app
