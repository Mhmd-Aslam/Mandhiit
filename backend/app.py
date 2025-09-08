from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Mock restaurant data
restaurants = [
    {
        "id": 1,
        "name": "Hyderabadi Biryani House",
        "location": "Downtown, City Center",
        "type": "Hyderabadi Cuisine",
        "rating": 4.8,
        "image": "https://images.unsplash.com/photo-1563379091339-03246963d51a?w=400",
        "description": "Authentic Hyderabadi biryani with traditional spices and tender meat.",
        "specialties": ["Chicken Biryani", "Mutton Biryani", "Vegetable Biryani"],
        "phone": "+1-234-567-8901",
        "address": "123 Main Street, Downtown"
    },
    {
        "id": 2,
        "name": "Royal Mandhi Palace",
        "location": "Heritage District",
        "type": "Arabian Cuisine",
        "rating": 4.6,
        "image": "https://images.unsplash.com/photo-1574484284002-952d92456975?w=400",
        "description": "Traditional Arabian mandhi with perfectly cooked rice and succulent meat.",
        "specialties": ["Lamb Mandhi", "Chicken Mandhi", "Fish Mandhi"],
        "phone": "+1-234-567-8902",
        "address": "456 Heritage Ave, Heritage District"
    },
    {
        "id": 3,
        "name": "Spice Garden Restaurant",
        "location": "Food Street",
        "type": "Multi-Cuisine",
        "rating": 4.5,
        "image": "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400",
        "description": "A fusion of flavors offering the best mandhi and biryani varieties.",
        "specialties": ["Mixed Grill Mandhi", "Seafood Biryani", "Vegetarian Platter"],
        "phone": "+1-234-567-8903",
        "address": "789 Food Street, Culinary Quarter"
    },
    {
        "id": 4,
        "name": "Traditional Flavors",
        "location": "Old Town",
        "type": "Traditional Cuisine",
        "rating": 4.7,
        "image": "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400",
        "description": "Family-owned restaurant serving authentic traditional mandhi for over 30 years.",
        "specialties": ["Traditional Goat Mandhi", "Chicken Kabsa", "Homemade Bread"],
        "phone": "+1-234-567-8904",
        "address": "321 Old Town Road, Historic Quarter"
    }
]

@app.route('/')
def home():
    return jsonify({"message": "Welcome to Best Mandhi in Town API"})

@app.route('/api/restaurants')
def get_restaurants():
    """Get all restaurants"""
    return jsonify(restaurants)

@app.route('/api/restaurants/<int:restaurant_id>')
def get_restaurant(restaurant_id):
    """Get a specific restaurant by ID"""
    restaurant = next((r for r in restaurants if r["id"] == restaurant_id), None)
    if restaurant:
        return jsonify(restaurant)
    return jsonify({"error": "Restaurant not found"}), 404

@app.route('/api/restaurants/search/<string:query>')
def search_restaurants(query):
    """Search restaurants by name or type"""
    query = query.lower()
    filtered_restaurants = [
        r for r in restaurants 
        if query in r["name"].lower() or query in r["type"].lower()
    ]
    return jsonify(filtered_restaurants)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
