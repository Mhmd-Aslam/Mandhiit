from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os
import json

from auth import auth_bp, token_blocklist

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Basic config for JWT
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-change-me")
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "dev-jwt-secret-change-me")

jwt = JWTManager(app)

@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    jti = jwt_payload.get("jti")
    return jti in token_blocklist

# Register auth blueprint
app.register_blueprint(auth_bp, url_prefix="/auth")

# Cloudinary setup (for photo uploads). Set env: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
try:
    import cloudinary
    import cloudinary.uploader
    cloudinary.config(
        cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME"),
        api_key=os.environ.get("CLOUDINARY_API_KEY"),
        api_secret=os.environ.get("CLOUDINARY_API_SECRET"),
        secure=True,
    )
    _cloudinary_enabled = all([
        os.environ.get("CLOUDINARY_CLOUD_NAME"),
        os.environ.get("CLOUDINARY_API_KEY"),
        os.environ.get("CLOUDINARY_API_SECRET"),
    ])
except Exception:
    cloudinary = None
    _cloudinary_enabled = False

import random

def build_kerala_mandi_dataset(n: int = 100):
    districts = {
        "Thiruvananthapuram": ["Kazhakkoottam", "Thampanoor", "Pattom", "Attingal", "Neyyattinkara"],
        "Kollam": ["Chinnakada", "Kottarakkara", "Paravur", "Karunagappally"],
        "Pathanamthitta": ["Adoor", "Ranni", "Thiruvalla"],
        "Alappuzha": ["Alappuzha Town", "Cherthala", "Kayamkulam"],
        "Kottayam": ["Kanjikuzhi", "Ettumanoor", "Pala", "Changanassery", "Erattupetta"],
        "Idukki": ["Thodupuzha", "Kattappana", "Munnar"],
        "Ernakulam": ["Edappally", "Aluva", "Kakkanad", "Fort Kochi", "Angamaly"],
        "Thrissur": ["Ollur", "Chalakudy", "Guruvayur", "City"],
        "Palakkad": ["Palakkad Town", "Ottapalam", "Chittur"],
        "Malappuram": ["Manjeri", "Perinthalmanna", "Kottakkal", "Tirur"],
        "Kozhikode": ["Palayam", "Mavoor Road", "Kallayi"],
        "Wayanad": ["Kalpetta", "Sulthan Bathery"],
        "Kannur": ["Kannur City", "Thalassery", "Payyannur"],
        "Kasaragod": ["Kasaragod", "Kanhangad"]
    }
    types = ["Arabian / Mandhi", "Yemeni / Mandhi", "Kuzhimandhi / Arabian", "Multicuisine + Mandhi"]
    specs = [
        ["Chicken Mandhi", "Mutton Mandhi"],
        ["Chicken Kuzhimandhi", "Al Faham"],
        ["Beef Mandhi", "BBQ"],
        ["Kabsa", "Shawarma", "Grills"],
    ]
    images = [
        "https://images.unsplash.com/photo-1550547660-d9450f859349?w=640",
        "https://images.unsplash.com/photo-1544025164-7c40e5a2c9f2?w=640",
        "https://images.unsplash.com/photo-1562967914-608f82629710?w=640",
        "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=640",
        "https://images.unsplash.com/photo-1604908554233-95e2e2ac43d8?w=640",
    ]
    out = []
    rid = 1
    # Even distribution across districts
    while len(out) < n:
        for dist, areas in districts.items():
            for area in areas:
                name_root = random.choice(["Majlis", "Barkas", "Hadramout", "Zam Zam", "Al Taza", "Arab Spice", "Al Razi", "Khaleef", "Go Grill", "Ajwa"]) 
                name = f"{name_root} Mandi"
                entry = {
                    "id": rid,
                    "name": name,
                    "location": f"{area}, {dist}",
                    "type": random.choice(types),
                    "rating": round(random.uniform(3.8, 4.6), 1),
                    "image": random.choice(images),
                    "description": "Popular mandhi spot with aromatic rice and tender meat.",
                    "specialties": random.choice(specs),
                    "phone": "N/A",
                    "address": f"{area}, {dist}, Kerala"
                }
                out.append(entry)
                rid += 1
                if len(out) >= n:
                    break
            if len(out) >= n:
                break
    return out

def _valid_restaurants_payload(data):
    if not isinstance(data, list) or len(data) == 0:
        return False
    # require minimal fields on first few
    for item in data[:5]:
        if not isinstance(item, dict):
            return False
        if not item.get('name') or not item.get('location'):
            return False
    return True

# Build dataset: prefer curated JSON if available
DATA_PATH = os.path.join(os.path.dirname(__file__), 'data', 'restaurants.json')
restaurants = None
if os.path.exists(DATA_PATH):
    try:
        with open(DATA_PATH, 'r', encoding='utf-8') as f:
            payload = json.load(f)
        if _valid_restaurants_payload(payload):
            restaurants = payload
        else:
            print('Curated restaurants.json is empty or invalid; falling back to generated dataset')
    except Exception as e:
        print('Failed to load curated restaurants.json, falling back to generator:', e)

if not restaurants:
    restaurants = build_kerala_mandi_dataset(100)

# Ensure every spot has a photo thumbnail
DEFAULT_THUMBNAIL = "https://images.unsplash.com/photo-1550547660-d9450f859349?w=640&auto=format&fit=crop&q=60"
for r in restaurants:
    if not r.get("image") or not isinstance(r.get("image"), str) or not r.get("image").strip():
        r["image"] = DEFAULT_THUMBNAIL

# If local mandhi photos exist in frontend/public/images/mandhi, use them sequentially
LOCAL_MANDHI_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'public', 'images', 'mandhi'))
local_thumbs = []
if os.path.isdir(LOCAL_MANDHI_DIR):
    try:
        names = sorted(os.listdir(LOCAL_MANDHI_DIR))
        for nm in names:
            low = nm.lower()
            if low.endswith(('.jpg', '.jpeg', '.png', '.webp')):
                # Public path for CRA
                local_thumbs.append(f"/images/mandhi/{nm}")
    except Exception as e:
        print('Could not list local mandhi images:', e)

if local_thumbs:
    total = len(local_thumbs)
    for i, r in enumerate(restaurants):
        r['image'] = local_thumbs[i % total]

# In-memory reviews store (demo). Replace with DB when ready.
# Each review: { id, restaurant_id, user_email, user_name, rating (1-5), comment, created_at }
reviews = []
_next_review_id = 1

# In-memory photos store (demo). Replace with DB when ready.
# Each photo: { id, review_id, restaurant_id, user_email, url, created_at }
photos = []
_next_photo_id = 1

@app.route('/')
def home():
    return jsonify({"message": "Welcome to Best Mandhi in Town API"})

@app.route('/api/assets/mandhi-images')
def list_mandhi_images():
    """Return the list of available mandhi thumbnail image paths (public URLs).
    Frontend can use this to assign thumbnails sequentially to avoid consecutive repeats.
    """
    return jsonify(local_thumbs)

@app.route('/api/restaurants')
def get_restaurants():
    """Get all restaurants with computed average rating and review count"""
    def avg_for(rid: int):
        vals = [r["rating"] for r in reviews if r["restaurant_id"] == rid]
        if not vals:
            return None, 0
        return round(sum(vals) / len(vals), 1), len(vals)

    enriched = []
    for r in restaurants:
        avg, count = avg_for(r["id"])
        item = dict(r)
        if avg is not None:
            item["avg_rating"] = avg
            item["review_count"] = count
        else:
            item["avg_rating"] = r.get("rating")
            item["review_count"] = 0
        enriched.append(item)
    return jsonify(enriched)

@app.route('/api/restaurants/<int:restaurant_id>')
def get_restaurant(restaurant_id):
    """Get a specific restaurant by ID (includes avg_rating and review_count)"""
    restaurant = next((r for r in restaurants if r["id"] == restaurant_id), None)
    if not restaurant:
        return jsonify({"error": "Restaurant not found"}), 404
    vals = [r["rating"] for r in reviews if r["restaurant_id"] == restaurant_id]
    avg = round(sum(vals) / len(vals), 1) if vals else restaurant.get("rating")
    data = dict(restaurant)
    data["avg_rating"] = avg
    data["review_count"] = len(vals)
    return jsonify(data)

@app.route('/api/restaurants/search/<string:query>')
def search_restaurants(query):
    """Search restaurants by name or type"""
    query = query.lower()
    filtered_restaurants = [
        r for r in restaurants 
        if query in r["name"].lower() or query in r["type"].lower()
    ]
    return jsonify(filtered_restaurants)

from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import uuid
import io
try:
    from PIL import Image
    _pil_enabled = True
except Exception:
    Image = None
    _pil_enabled = False

@app.route('/api/restaurants/<int:restaurant_id>/reviews', methods=['GET'])
def list_reviews(restaurant_id):
    """List reviews for a restaurant."""
    # Ensure restaurant exists
    if not any(r["id"] == restaurant_id for r in restaurants):
        return jsonify({"error": "Restaurant not found"}), 404
    data = [r for r in reviews if r["restaurant_id"] == restaurant_id]
    return jsonify(data)

# -----------------------------
# Simple Accounts (No Auth)
# -----------------------------
# Each user: { id (10-digit string), name, avatar_url (optional), created_at }
users = []

def _generate_user_id() -> str:
    """Generate a unique 10-digit numeric ID (as a string)."""
    import random
    while True:
        uid = ''.join(str(random.randint(0, 9)) for _ in range(10))
        if not any(u.get('id') == uid for u in users):
            return uid

@app.route('/api/accounts', methods=['POST'])
def create_account():
    """Create an account with required name and optional avatar upload.
    Accepts either:
      - multipart/form-data: fields => name (text, required), avatar (file, optional)
      - application/json: { name: string, avatar_url?: string }
    If an avatar file is provided and Pillow is available, performs a center 1:1 crop before upload.
    Returns 201 with: { id, name, avatar_url, created_at }
    """
    name = None
    avatar_url = None

    if request.content_type and request.content_type.startswith('multipart/'):
        name = (request.form.get('name') or '').strip()
        avatar_file = request.files.get('avatar')
        if avatar_file and getattr(avatar_file, 'filename', ''):
            # Attempt server-side 1:1 crop if Pillow is available
            file_to_upload = avatar_file
            if _pil_enabled:
                try:
                    img = Image.open(avatar_file.stream).convert('RGB')
                    w, h = img.size
                    side = min(w, h)
                    left = (w - side) // 2
                    top = (h - side) // 2
                    right = left + side
                    bottom = top + side
                    img_sq = img.crop((left, top, right, bottom))
                    buf = io.BytesIO()
                    img_sq.save(buf, format='JPEG', quality=90)
                    buf.seek(0)
                    file_to_upload = buf
                except Exception as ex:
                    print('Pillow crop failed, uploading original:', ex)
                    avatar_file.stream.seek(0)
                    file_to_upload = avatar_file
            if _cloudinary_enabled:
                try:
                    up = cloudinary.uploader.upload(
                        file_to_upload,
                        folder='bmit/users/avatars',
                        resource_type='image',
                    )
                    avatar_url = up.get('secure_url') or up.get('url')
                except Exception as ex:
                    print('Cloudinary avatar upload failed:', ex)
    else:
        data = request.get_json(silent=True) or {}
        name = (data.get('name') or '').strip()
        avatar_url = (data.get('avatar_url') or '').strip() or None

    if not name:
        return jsonify({"error": "'name' is required"}), 400

    user = {
        "id": _generate_user_id(),
        "name": name,
        "avatar_url": avatar_url,
        "created_at": datetime.utcnow().isoformat() + "Z",
    }
    users.append(user)
    return jsonify(user), 201

@app.route('/api/accounts/<user_id>', methods=['GET'])
def get_account(user_id):
    user = next((u for u in users if u["id"] == user_id), None)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user)

@app.route('/api/accounts/<user_id>/reviews', methods=['GET'])
def list_user_reviews(user_id):
    """List reviews written by this account. We match by user_name for the simple demo.
    Returns newest-first list of reviews.
    """
    user = next((u for u in users if u["id"] == user_id), None)
    if not user:
        return jsonify({"error": "User not found"}), 404
    name = user.get('name')
    data = [r for r in reviews if r.get('user_name') == name]
    data.sort(key=lambda r: r.get('created_at', ''), reverse=True)
    return jsonify(data)

@app.route('/api/accounts/<user_id>', methods=['PATCH'])
def update_account(user_id):
    """Update an account's name and/or avatar. Accepts multipart/form-data or JSON.
    Multipart: fields => name? (text), avatar? (file)
    JSON: { name?: string, avatar_url?: string }
    Performs 1:1 crop if Pillow is available for file uploads.
    """
    user = next((u for u in users if u["id"] == user_id), None)
    if not user:
        return jsonify({"error": "User not found"}), 404

    new_name = None
    new_avatar_url = None

    if request.content_type and request.content_type.startswith('multipart/'):
        new_name = (request.form.get('name') or '').strip() or None
        avatar_file = request.files.get('avatar')
        if avatar_file and getattr(avatar_file, 'filename', ''):
            file_to_upload = avatar_file
            if _pil_enabled:
                try:
                    img = Image.open(avatar_file.stream).convert('RGB')
                    w, h = img.size
                    side = min(w, h)
                    left = (w - side) // 2
                    top = (h - side) // 2
                    right = left + side
                    bottom = top + side
                    img_sq = img.crop((left, top, right, bottom))
                    buf = io.BytesIO()
                    img_sq.save(buf, format='JPEG', quality=90)
                    buf.seek(0)
                    file_to_upload = buf
                except Exception as ex:
                    print('Pillow crop failed, uploading original:', ex)
                    avatar_file.stream.seek(0)
                    file_to_upload = avatar_file
            if _cloudinary_enabled:
                try:
                    up = cloudinary.uploader.upload(
                        file_to_upload,
                        folder='bmit/users/avatars',
                        resource_type='image',
                    )
                    new_avatar_url = up.get('secure_url') or up.get('url')
                except Exception as ex:
                    print('Cloudinary avatar upload failed:', ex)
    else:
        data = request.get_json(silent=True) or {}
        new_name = (data.get('name') or '').strip() or None
        new_avatar_url = (data.get('avatar_url') or '').strip() or None

    if new_name is not None and new_name:
        user['name'] = new_name
    if new_avatar_url is not None:
        user['avatar_url'] = new_avatar_url

    return jsonify(user)

@app.route('/api/restaurants/<int:restaurant_id>/reviews', methods=['POST'])
@jwt_required()
def create_review(restaurant_id):
    """Create a review for a restaurant (auth required).
    Supports JSON or multipart/form-data with optional photo uploads (key: photos).
    """
    global _next_review_id, _next_photo_id
    # Ensure restaurant exists
    if not any(r["id"] == restaurant_id for r in restaurants):
        return jsonify({"error": "Restaurant not found"}), 404

    rating = None
    comment = ""
    files = []

    if request.content_type and request.content_type.startswith('multipart/'):
        form = request.form
        rating = form.get("rating")
        comment = (form.get("comment") or "").strip()
        files = request.files.getlist("photos") or []
    else:
        payload = request.get_json(silent=True) or {}
        rating = payload.get("rating")
        comment = (payload.get("comment") or "").strip()

    try:
        rating = int(rating)
    except Exception:
        return jsonify({"error": "Rating must be an integer between 1 and 5"}), 400
    if rating < 1 or rating > 5:
        return jsonify({"error": "Rating must be between 1 and 5"}), 400

    email = get_jwt_identity()
    user_name = email.split('@')[0] if email else "Anonymous"
    review = {
        "id": _next_review_id,
        "restaurant_id": restaurant_id,
        "user_email": email,
        "user_name": user_name,
        "rating": rating,
        "comment": comment,
        "created_at": datetime.utcnow().isoformat() + "Z",
    }
    _next_review_id += 1
    reviews.append(review)

    # Upload any photos if provided
    uploaded_photos = []
    if files:
        if not _cloudinary_enabled:
            return jsonify({"error": "Photo upload not configured"}), 500
        for f in files:
            if not f or not getattr(f, 'filename', ''):
                continue
            try:
                up = cloudinary.uploader.upload(
                    f,
                    folder=f"bmit/restaurants/{restaurant_id}/reviews/{review['id']}",
                    resource_type="image",
                )
                photo = {
                    "id": _next_photo_id,
                    "review_id": review["id"],
                    "restaurant_id": restaurant_id,
                    "user_email": email,
                    "url": up.get("secure_url") or up.get("url"),
                    "created_at": datetime.utcnow().isoformat() + "Z",
                }
                _next_photo_id += 1
                photos.append(photo)
                uploaded_photos.append(photo)
            except Exception as ex:
                # Continue on single-file failure
                print("Cloudinary upload failed:", ex)

    out = dict(review)
    if uploaded_photos:
        out["photos"] = uploaded_photos
    return jsonify(out), 201

@app.route('/api/reviews/<int:review_id>/photos', methods=['POST'])
@jwt_required()
def upload_review_photos(review_id):
    """Upload photos to an existing review (multipart/form-data, key: photos)."""
    global _next_photo_id
    review = next((r for r in reviews if r["id"] == review_id), None)
    if not review:
        return jsonify({"error": "Review not found"}), 404
    restaurant_id = review["restaurant_id"]
    email = get_jwt_identity()
    if not (request.content_type and request.content_type.startswith('multipart/')):
        return jsonify({"error": "Content-Type must be multipart/form-data"}), 400
    files = request.files.getlist("photos") or []
    if not files:
        return jsonify({"error": "No files uploaded"}), 400
    if not _cloudinary_enabled:
        return jsonify({"error": "Photo upload not configured"}), 500

    uploaded = []
    for f in files:
        if not f or not getattr(f, 'filename', ''):
            continue
        try:
            up = cloudinary.uploader.upload(
                f,
                folder=f"bmit/restaurants/{restaurant_id}/reviews/{review_id}",
                resource_type="image",
            )
            photo = {
                "id": _next_photo_id,
                "review_id": review_id,
                "restaurant_id": restaurant_id,
                "user_email": email,
                "url": up.get("secure_url") or up.get("url"),
                "created_at": datetime.utcnow().isoformat() + "Z",
            }
            _next_photo_id += 1
            photos.append(photo)
            uploaded.append(photo)
        except Exception as ex:
            print("Cloudinary upload failed:", ex)

    return jsonify(uploaded), 201

@app.route('/api/restaurants/<int:restaurant_id>/photos', methods=['GET'])
def list_restaurant_photos(restaurant_id):
    """List photos for a restaurant (aggregated from reviews)."""
    if not any(r["id"] == restaurant_id for r in restaurants):
        return jsonify({"error": "Restaurant not found"}), 404
    data = [p for p in photos if p["restaurant_id"] == restaurant_id]
    # newest first
    data.sort(key=lambda p: p["created_at"], reverse=True)
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
