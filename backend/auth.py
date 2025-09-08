from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    get_jwt_identity,
    jwt_required,
    get_jwt,
)
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta
import re
import os
try:
    from google.oauth2 import id_token as google_id_token
    from google.auth.transport import requests as google_requests
    GOOGLE_LIBS_AVAILABLE = True
except Exception:
    google_id_token = None
    google_requests = None
    GOOGLE_LIBS_AVAILABLE = False

auth_bp = Blueprint("auth", __name__)

# In-memory user store for demo purposes only
# In production, replace with a database.
users = {}

# Token blocklist to support logout (revocation)
token_blocklist = set()

_email_regex = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _valid_email(email: str) -> bool:
    return bool(_email_regex.match(email or ""))


@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json(force=True, silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    name = (data.get("name") or "").strip() or email.split("@")[0]

    if not _valid_email(email):
        return jsonify({"error": "Invalid email"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    if email in users:
        return jsonify({"error": "Email already registered"}), 409

    users[email] = {
        "email": email,
        "name": name,
        "password_hash": generate_password_hash(password),
        "auth_provider": "password",
    }

    access_token = create_access_token(identity=email, expires_delta=timedelta(hours=12))
    return jsonify({
        "message": "Signup successful",
        "access_token": access_token,
        "user": {"email": email, "name": name}
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(force=True, silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = users.get(email)
    if not user or not check_password_hash(user.get("password_hash", ""), password):
        return jsonify({"error": "Invalid email or password"}), 401

    access_token = create_access_token(identity=email, expires_delta=timedelta(hours=12))
    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": {"email": email, "name": user.get("name")}
    })


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    jti = get_jwt().get("jti")
    token_blocklist.add(jti)
    return jsonify({"message": "Logged out"})


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    email = get_jwt_identity()
    user = users.get(email) or {}
    return jsonify({
        "email": user.get("email"),
        "name": user.get("name"),
        "auth_provider": user.get("auth_provider")
    })


# Optional: Google OAuth placeholders (scaffold)
# NOTE: This is a scaffold only; real Google OAuth requires client credentials,
# redirect handling, and verifying Google ID tokens. Left here for future expansion.
@auth_bp.route("/google/start", methods=["GET"])
def google_start():
    return jsonify({"message": "Google OAuth not yet configured. Provide GOOGLE_CLIENT_ID/SECRET and implement flow."}), 501

@auth_bp.route("/google/callback", methods=["GET"])
def google_callback():
    return jsonify({"error": "Google OAuth callback not implemented in this demo."}), 501


@auth_bp.route("/google/login", methods=["POST"])
def google_login():
    """Login with a Google ID token from Google Sign-In / One Tap.

    Body: { "id_token": "<google_id_token>" }
    """
    if not GOOGLE_LIBS_AVAILABLE:
        return jsonify({"error": "Google login unavailable: google-auth libs not installed"}), 501
    data = request.get_json(force=True, silent=True) or {}
    token = (data.get("id_token") or "").strip()
    client_id = os.environ.get("GOOGLE_CLIENT_ID")
    if not client_id:
        return jsonify({"error": "Server is missing GOOGLE_CLIENT_ID"}), 500
    if not token:
        return jsonify({"error": "Missing id_token"}), 400

    try:
        idinfo = google_id_token.verify_oauth2_token(
            token, google_requests.Request(), client_id
        )
        # idinfo contains fields like: sub, email, email_verified, name, picture
        email = (idinfo.get("email") or "").lower()
        email_verified = idinfo.get("email_verified", False)
        name = idinfo.get("name") or email.split("@")[0]
        if not email or not email_verified:
            return jsonify({"error": "Unverified Google account"}), 401

        user = users.get(email)
        if not user:
            users[email] = {
                "email": email,
                "name": name,
                "password_hash": None,
                "auth_provider": "google",
            }
        else:
            users[email]["auth_provider"] = "google"
            users[email]["name"] = users[email].get("name") or name

        access_token = create_access_token(identity=email, expires_delta=timedelta(hours=12))
        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "user": {"email": email, "name": name, "auth_provider": "google"}
        })
    except Exception as e:
        return jsonify({"error": "Invalid Google token", "detail": str(e)}), 401
