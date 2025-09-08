from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os

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

# Real Mandhi spots in Kottayam district (sourced: Restaurant Guru, Justdial)
# Sources:
# - Khaleef Mandi: Restaurant Guru (phone), Justdial (address)
#   RG: https://restaurant-guru.in/Khaleef-Mandi-Kottayam (phone: +91 89435 89438)
#   JD: https://www.justdial.com/Kottayam/Khaleef-Mandi-Opposite-Royal-Enfield-Showroom-Kottayam-HO/9999PX481-X481-210810205249-Y1E4_BZDET
#       Address: Opposite Royal Enfield Showroom, Kumarakom Road, Chalakunnu, Kottayam HO-686001
# - Al Baike Mandhi Hub (Erattupetta): Justdial
#   JD: https://www.justdial.com/Kottayam/Al-Baike-Mandhi-Hub-Erattupetta/9999PX481-X481-220414215246-Q7C4_BZDET
#       Address: Central Junction, 1, Erattupetta-686121
# - Ajwa Food Park – Kuzhi Manthi @ Erattupetta (Pala Town): Justdial
#   JD: https://www.justdial.com/Kottayam/Ajwa-Food-Park-Kuzhi-Manthi-Erattupetta-NEAR-COLLEGE-PADI-Pala-Town/9999PX481-X481-191102101002-N3I8_BZDET
#       Address: NEAR COLLEGE PADI, 6TH MILE, PALA ROAD, Pala Town-686575
restaurants = [
    {
        "id": 1,
        "name": "Khaleef Mandi",
        "location": "Chalakunnu, Kottayam",
        "type": "Mandhi / Arabic",
        "rating": 4.0,
        "image": "https://content.jdmagicbox.com/v2/comp/kottayam/e4/9999px481.x481.210810205249.y1e4/catalogue/khaleef-mandi-kottayam-ho-kottayam-arabic-delivery-restaurants-pavm0hack8.jpg?w=640",
        "description": "Popular spot for chicken and beef Mandhi in Kottayam with generous portions.",
        "specialties": ["Chicken Mandhi", "Beef Mandhi", "Biryani"],
        "phone": "+91 89435 89438",
        "address": "Opposite Royal Enfield Showroom, Kumarakom Road, Chalakunnu, Kottayam HO 686001"
    },
    {
        "id": 2,
        "name": "Al Baike Mandhi Hub",
        "location": "Erattupetta, Kottayam",
        "type": "Mandhi / Arabian",
        "rating": 4.0,
        "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=400",
        "description": "Mandhi and fried chicken with a clean ambience at Erattupetta Central Junction.",
        "specialties": ["Chicken Mandhi", "Beef Mandhi", "Fried Chicken"],
        "phone": "",
        "address": "Central Junction, 1, Erattupetta 686121"
    },
    {
        "id": 3,
        "name": "Ajwa Food Park – Kuzhi Manthi",
        "location": "Pala Town, Kottayam",
        "type": "Kuzhi Mandhi / Arabian",
        "rating": 4.2,
        "image": "https://content.jdmagicbox.com/comp/kottayam/i8/9999px481.x481.191102101002.n3i8/catalogue/ajwa-food-park-kuzhi-manthi-erattupetta-pala-town-kottayam-restaurants-xxtkyczrhy-250.jpg?w=640",
        "description": "Well-known for flavorful and tender Kuzhi Mandhi with generous portions.",
        "specialties": ["Kuzhi Mandhi", "Chicken Mandhi"],
        "phone": "",
        "address": "NEAR COLLEGE PADI, 6TH MILE, PALA ROAD, Pala Town 686575"
    },
    {
        # Source: Justdial
        # https://www.justdial.com/Kottayam/Al-Ajmi-Yemen-Mandi-Near-Sh32-Erattupetta/9999PX481-X481-220320202833-Q9R6_BZDET
        # Address: Kaduvamuzhi, Kerala, Near SH32, Erattupetta 686121
        "id": 4,
        "name": "Al Ajmi Yemen Mandi",
        "location": "Erattupetta, Kottayam",
        "type": "Yemeni Mandhi / Arabian",
        "rating": 4.0,
        "image": "https://content.jdmagicbox.com/comp/kottayam/r6/9999px481.x481.220320202833.q9r6/catalogue/al-ajmi-yemen-mandi-kottayam-restaurants-ks2w8c41vq.jpg?w=640",
        "description": "Yemeni-style Mandhi near SH32 at Erattupetta; popular local pick.",
        "specialties": ["Chicken Mandhi", "Mutton Mandhi"],
        "phone": "",
        "address": "Kaduvamuzhi, Near SH32, Erattupetta 686121"
    },
    {
        # 5) Al Razi Restaurant — Kanjikuzhi, Kottayam (sources: Justdial, Quickerala, Instagram)
        "id": 5,
        "name": "Al Razi Restaurant",
        "location": "Kanjikuzhi (KK Road), Kottayam",
        "type": "Kuzhimandhi / Arabian",
        "rating": 4.1,
        "image": "https://images.unsplash.com/photo-1604908554233-95e2e2ac43d8?w=640",
        "description": "Arab/Yemeni-style kuzhimandhi and Al Faham; spacious ambiance; local favorite for chicken mandhi.",
        "specialties": ["Chicken Kuzhimandhi", "Al Faham", "BBQ Chicken"],
        "phone": "",
        "address": "Kanjikuzhi, KK Road area, Kottayam"
    },
    {
        # 6) Malabar Majlis Kuzhimandhi Restaurant — Kodimatha, Kottayam (sources: Zomato, Justdial)
        "id": 6,
        "name": "Malabar Majlis Kuzhimandhi Restaurant",
        "location": "Kodimatha, Kottayam",
        "type": "Arabian / Mandhi",
        "rating": 4.0,
        "image": "https://images.unsplash.com/photo-1544025162-d76694265947?w=640",
        "description": "Arabian mandhi menu with Al Faham, BBQ manthi, beef manthi; good for delivery & takeaway.",
        "specialties": ["Al Faham", "BBQ Manthi", "Beef Manthi"],
        "phone": "",
        "address": "Kodimatha, Kottayam"
    },
    {
        # 7) Majlis Yemen Mandi — Kuravilangadu, Kottayam (source: Justdial)
        "id": 7,
        "name": "Majlis Yemen Mandi",
        "location": "Kuravilangadu, Kottayam",
        "type": "Yemeni Mandhi / Arabian",
        "rating": 4.0,
        "image": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=640",
        "description": "Yemen/Arab-style mandhi and grills; popular with many customer reviews.",
        "specialties": ["Chicken Mandhi", "Mutton Mandhi", "Grilled Platters"],
        "phone": "",
        "address": "Kuravilangadu, Kottayam"
    },
    {
        # 8) Barkas Kuzhimanthi — Kothanallur (Kandanattil Building / near PNB, Thoovanissa Jn) (source: Justdial)
        "id": 8,
        "name": "Barkas Kuzhimanthi",
        "location": "Kothanallur, Kottayam",
        "type": "Kuzhimandhi / Arabian",
        "rating": 4.0,
        "image": "https://images.unsplash.com/photo-1544025164-7c40e5a2c9f2?w=640",
        "description": "Kuzhimandhi-focused outlet; frequently listed among local best mandi spots.",
        "specialties": ["Chicken Kuzhimandhi", "Beef Kuzhimandhi"],
        "phone": "",
        "address": "Kandanattil Building, near Punjab National Bank, Thoovanissa Junction, Kothanallur, Kottayam"
    },
    {
        # 9) Moopans Restaurant — Athirampuzha, Opp. Arcadia Hotel (source: Justdial)
        "id": 9,
        "name": "Moopans Restaurant",
        "location": "Athirampuzha, Kottayam",
        "type": "Multicuisine + Kuzhimandhi",
        "rating": 4.0,
        "image": "https://images.unsplash.com/photo-1562967914-608f82629710?w=640",
        "description": "Long-standing local restaurant serving kuzhimandhi alongside a broad menu.",
        "specialties": ["Kuzhimandhi", "Al Faham", "Shawarma"],
        "phone": "",
        "address": "Opposite Arcadia Hotel, MC Road, Athirampuzha, Kottayam"
    },
    {
        # 10) Food Book Multicuisine Restaurant — Aruvithura / Erattupetta (source: Justdial)
        "id": 10,
        "name": "Food Book Multicuisine Restaurant",
        "location": "Aruvithura / Erattupetta, Kottayam",
        "type": "Multicuisine + Kuzhimandhi",
        "rating": 4.0,
        "image": "https://images.unsplash.com/photo-1544025166-94f2807cc73b?w=640",
        "description": "Multicuisine restaurant with kuzhimandhi available; accessible near Central Jn area.",
        "specialties": ["Kuzhimandhi", "Grilled Chicken"],
        "phone": "",
        "address": "Aruvithura / Central Junction area, near St. George Forane Church, Erattupetta, Kottayam"
    },
    {
        # 11) Tamam Kuzhimanthi — Erattupetta / Aruvithura (source: Justdial)
        "id": 11,
        "name": "Tamam Kuzhimanthi",
        "location": "Erattupetta (Aruvithura), Kottayam",
        "type": "Kuzhimanthi / Mandhi",
        "rating": 3.9,
        "image": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=640",
        "description": "Local mandi outlet offering kuzhimanthi and related items; steady local patronage.",
        "specialties": ["Kuzhimanthi", "Chicken Mandhi"],
        "phone": "",
        "address": "Aruvithura / central Erattupetta area, Kottayam"
    },
    {
        # 12) Ikkannte Manthikada (Ikkante Mandhikkada) — Thalayolaparambu (source: Justdial / Instagram)
        "id": 12,
        "name": "Ikkannte Manthikada",
        "location": "Thalayolaparambu, Kottayam",
        "type": "Kuzhimanthi / Mandhi",
        "rating": 4.2,
        "image": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=640",
        "description": "Popular local mandi joint near DB College; strong social presence and reviews.",
        "specialties": ["Kuzhimanthi", "Chicken Mandhi"],
        "phone": "+91 90740 94186",
        "address": "Opposite DB College, Vettikkattumukku, Thalayolaparambu, Kottayam"
    },
    {
        # 13) Go Grill – The Chick Workshop — Erattupetta (sources: Restaurant Guru / Instagram / Justdial)
        "id": 13,
        "name": "Go Grill – The Chick Workshop",
        "location": "Kaduvamuzhi, Erattupetta, Kottayam",
        "type": "Arabian Grills + Mandhi",
        "rating": 4.2,
        "image": "https://images.unsplash.com/photo-1550547660-acef4926b7f8?w=640",
        "description": "Arabian-style grills (Al Faham, kebabs, shawarma plates); known locally; parking available.",
        "specialties": ["Al Faham", "Shawarma Plates", "Peri-Peri Chicken", "Mandhi"],
        "phone": "+91 98469 81000",
        "address": "MQVG+8HP, Opp. RIMS Hospital, Kaduvamuzhi, Erattupetta 686121"
    }
]

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

@app.route('/api/restaurants/<int:restaurant_id>/reviews', methods=['GET'])
def list_reviews(restaurant_id):
    """List reviews for a restaurant."""
    # Ensure restaurant exists
    if not any(r["id"] == restaurant_id for r in restaurants):
        return jsonify({"error": "Restaurant not found"}), 404
    data = [r for r in reviews if r["restaurant_id"] == restaurant_id]
    return jsonify(data)

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
