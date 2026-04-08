import os
import json
import uuid
import numpy as np
import tensorflow as tf
import tempfile
from dotenv import load_dotenv

load_dotenv()

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from email_validator import validate_email, EmailNotValidError
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from datetime import timedelta, datetime
from bson import json_util
import json

from utils.preprocess import preprocess_image
from utils.cost_estimator import estimate_repair_cost
from utils.cloudinary_helper import upload_image
from utils.gemini_helper import generate_repair_suggestions, generate_analytics_summary
from damage_extractor_api import DamageExtractorAPI

app = Flask(__name__)
# Enable CORS for all domains to prevent cross-origin issues across typical vite dev ports
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Database & Auth Config
app.config["MONGO_URI"] = os.getenv("MONGO_URI", "mongodb://localhost:27017/damage_detector")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret-key")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=1)

mongo = PyMongo(app)
try:
    # Attempt to check if connection is successful
    mongo.cx.server_info()
    print("MongoDB Connected Successfully")
except Exception as e:
    print(f"MongoDB Connection Failed: {e}")

bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Load ML Models
# Adjust paths if necessary, assuming running from backend/ directory
# Load ML Models (SAFE PATH FOR RENDER)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

car_model_path = os.path.join(BASE_DIR, "model", "model", "car_model_detector.keras")
severity_model_path = os.path.join(BASE_DIR, "model", "final_vehicle_damage_model.keras")
labels_path = os.path.join(BASE_DIR, "model", "car_labels.json")

print("Loading models...")
print("Car model path:", car_model_path)
print("Severity model path:", severity_model_path)

try:
    car_model = tf.keras.models.load_model(car_model_path)
    severity_model = tf.keras.models.load_model(severity_model_path)

    with open(labels_path, "r") as f:
        car_labels = json.load(f)

    print("✅ Models loaded successfully")

except Exception as e:
    print("❌ Model loading failed:", str(e))
    raise e

extractor = DamageExtractorAPI()

# ---------------------------------------------------------
# ROUTES
# ---------------------------------------------------------

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "message": "Backend is running with Cloudinary support"})

# ---------------------------------------------------------
# STEP 1: CAR TYPE DETECTION
# ---------------------------------------------------------
@app.route("/api/predict_car", methods=["POST"])
def predict_car():
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    file = request.files["image"]
    
    # Create a temporary file to save the upload
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp:
        temp_path = temp.name
        file.save(temp_path)

    try:
        # 1. Process with Model
        img = preprocess_image(temp_path)
        pred = car_model.predict(np.array([img]))[0]
        index = np.argmax(pred)
        car_type = car_labels[str(index)]
        
        # 2. Upload to Cloudinary
        image_url = upload_image(temp_path)
        
        if not image_url:
            return jsonify({"error": "Failed to upload image to cloud storage"}), 500

        return jsonify({
            "car_type": car_type,
            "image_url": image_url
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)

# ---------------------------------------------------------
# STEP 2: SEVERITY PREDICTION
# ---------------------------------------------------------
@app.route("/api/predict_severity", methods=["POST"])
def predict_severity():
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400
        
    file = request.files["image"]
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp:
        temp_path = temp.name
        file.save(temp_path)

    try:
        img = preprocess_image(temp_path)
        pred = severity_model.predict(np.array([img]))[0]

        labels = ["minor", "moderate", "severe"]
        severity = labels[np.argmax(pred)]
        
        image_url = upload_image(temp_path)
        if not image_url:
             return jsonify({"error": "Failed to upload image to cloud storage"}), 500
        
        return jsonify({
            "severity": severity,
            "image_url": image_url
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

# ---------------------------------------------------------
# STEP 3: YOLO DAMAGE DETECTION + COST ESTIMATION
# ---------------------------------------------------------
@app.route("/api/predict_yolo", methods=["POST"])
def predict_yolo():
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400
        
    file = request.files["image"]
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp:
        temp_path = temp.name
        file.save(temp_path)
        
    output_temp_path = None

    try:
        # 1. Extract Damage
        result = extractor.extract(temp_path)
        preds = result["raw_predictions"]

        # 2. Visualize and Save to NEW Temp File
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as out_temp:
            output_temp_path = out_temp.name
        
        extractor.visualize(temp_path, preds, output_temp_path)

        # 3. Upload Output to Cloudinary
        output_url = upload_image(output_temp_path)
        original_url = upload_image(temp_path) # Optional: verify if user wants original too

        if not output_url:
            return jsonify({"error": "Failed to upload processed image"}), 500

        severity = result["severity"]
        damaged_parts = result["damaged_parts"]

        return jsonify({
            "severity": severity,
            "damaged_parts": damaged_parts,
            "image_url": output_url,
            "original_image_url": original_url
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        if output_temp_path and os.path.exists(output_temp_path):
            os.remove(output_temp_path)

# ---------------------------------------------------------
# STEP 4: COST ESTIMATION
# ---------------------------------------------------------
@app.route("/api/estimate_cost", methods=["POST"])
def estimate_cost():
    data = request.json
    car_type = data.get("car_type")
    severity = data.get("severity")
    damaged_parts = data.get("damaged_parts")
    
    if car_type is None or severity is None or damaged_parts is None:
         return jsonify({"error": "Missing required fields"}), 400

    try:
        estimated_cost = estimate_repair_cost(
            car_type,
            severity,
            damaged_parts
        )
        
        return jsonify({
            "estimated_cost": estimated_cost
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------------------------------------------------
# STEP 5: AI SUGGESTIONS (GEMINI)
# ---------------------------------------------------------
@app.route("/api/generate_suggestions", methods=["POST"])
def generate_suggestions():
    data = request.json
    car_type = data.get("car_type")
    severity = data.get("severity")
    damaged_parts = data.get("damaged_parts")
    estimated_cost = data.get("estimated_cost")
    
    if car_type is None or severity is None or damaged_parts is None or estimated_cost is None:
         return jsonify({"error": "Missing required fields"}), 400

    try:
        suggestions = generate_repair_suggestions(
            car_type,
            severity,
            damaged_parts,
            estimated_cost
        )
        
        return jsonify({
            "suggestions": suggestions
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------------------------------------------------
# STEP 9b: PROJECT CHATBOT
# ---------------------------------------------------------
from utils.gemini_helper import get_chatbot_response

@app.route("/api/chat", methods=["POST"])
def chat_with_bot():
    data = request.json
    user_message = data.get("message")
    
    if not user_message:
        return jsonify({"error": "Message is required"}), 400
        
    response = get_chatbot_response(user_message)
    return jsonify({"response": response})

# ---------------------------------------------------------
# STEP 6: AUTHENTICATION
# ---------------------------------------------------------
@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not all([name, email, password]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        validate_email(email)
    except EmailNotValidError:
        return jsonify({"error": "Invalid email address"}), 400

    users = mongo.db.users
    if users.find_one({"email": email}):
        return jsonify({"error": "Email already exists"}), 400

    try:
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        
        user_id = users.insert_one({
            "name": name,
            "email": email,
            "password": hashed_password
        }).inserted_id

        access_token = create_access_token(identity=str(user_id))
        
        return jsonify({
            "message": "User registered successfully",
            "token": access_token,
            "user": {"id": str(user_id), "name": name, "email": email}
        }), 201
    except Exception as e:
        print(f"REGISTRATION ERROR: {str(e)}") # Print to server console
        return jsonify({"error": f"Registration failed: {str(e)}"}), 500

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Missing email or password"}), 400

    users = mongo.db.users
    user = users.find_one({"email": email})

    if user and bcrypt.check_password_hash(user["password"], password):
        access_token = create_access_token(identity=str(user["_id"]))
        return jsonify({
            "message": "Login successful",
            "token": access_token,
            "user": {"id": str(user["_id"]), "name": user["name"], "email": user["email"]}
        }), 200
    
    
    return jsonify({"error": "Invalid credentials"}), 401

@app.route("/api/auth/google", methods=["POST"])
def google_auth():
    data = request.json
    token = data.get("token")
    
    if not token:
        return jsonify({"error": "Token is required"}), 400
        
    try:
        # Verify the token
        # Specify the CLIENT_ID of the app that accesses the backend:
        # id_info = id_token.verify_oauth2_token(token, google_requests.Request(), CLIENT_ID)
        
        # Or, if you have multiple clients or want to allow any (less secure, but okay for dev):
        id_info = id_token.verify_oauth2_token(token, google_requests.Request())
        
        # Get user info
        email = id_info.get("email")
        name = id_info.get("name")
        google_id = id_info.get("sub")
        
        if not email:
            return jsonify({"error": "Invalid token: Email not found"}), 400
            
        users = mongo.db.users
        user = users.find_one({"email": email})
        
        if not user:
            # Register new user
            user_id = users.insert_one({
                "name": name,
                "email": email,
                "google_id": google_id,
                "password": "", # No password for Google users
                "auth_provider": "google"
            }).inserted_id
            
            # Create token
            access_token = create_access_token(identity=str(user_id))
            
            return jsonify({
                "message": "User registered successfully via Google",
                "token": access_token,
                "user": {"id": str(user_id), "name": name, "email": email}
            }), 201
        else:
            # Update google_id if missing (linking accounts)
            if "google_id" not in user:
                users.update_one({"_id": user["_id"]}, {"$set": {"google_id": google_id, "auth_provider": "google"}})
            
            # Login existing user
            access_token = create_access_token(identity=str(user["_id"]))
            
            return jsonify({
                "message": "Login successful via Google",
                "token": access_token,
                "user": {"id": str(user["_id"]), "name": user["name"], "email": user["email"]}
            }), 200
            
    except ValueError as e:
        return jsonify({"error": f"Invalid token: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/auth/me", methods=["GET"])
@jwt_required()
def get_current_user():
    current_user_id = get_jwt_identity()
    user = mongo.db.users.find_one({"_id": PyMongo.ObjectId(current_user_id)})
    if user:
        return jsonify({
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"]
        }), 200
    return jsonify({"error": "User not found"}), 404

# ---------------------------------------------------------
# STEP 7: HISTORY
# ---------------------------------------------------------
@app.route("/api/history", methods=["POST"])
@jwt_required()
def save_history():
    current_user_id = get_jwt_identity()
    data = request.json
    
    # Basic validation
    if not data:
        return jsonify({"error": "No data provided"}), 400

    record = {
        "user_id": str(current_user_id),
        "timestamp": datetime.utcnow().isoformat(),
        "car_type": data.get("car_type"),
        "severity": data.get("severity"),
        "damaged_parts": data.get("damaged_parts"),
        "estimated_cost": data.get("estimated_cost"),
        "images": data.get("images", {}) #Store URLs for car, severity, damage images
    }

    try:
        mongo.db.history.insert_one(record)
        return jsonify({"message": "History saved successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/history", methods=["GET"])
@jwt_required()
def get_history():
    current_user_id = get_jwt_identity()
    
    try:
        # Fetch history for user, sort by timestamp desc
        history_cursor = mongo.db.history.find(
            {"user_id": str(current_user_id)}
        ).sort("timestamp", -1)
        
        history_list = []
        for record in history_cursor:
            record["_id"] = str(record["_id"])
            history_list.append(record)
            
        return jsonify(json.loads(json_util.dumps(history_list))), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------------------------------------------------
# STEP 8: ANALYTICS (NEW)
# ---------------------------------------------------------
@app.route("/api/analytics", methods=["GET"])
@jwt_required()
def get_analytics():
    current_user_id = get_jwt_identity()
    
    try:
        # Aggregation Pipeline
        pipeline = [
            {"$match": {"user_id": str(current_user_id)}},
            {"$facet": {
                "total_assessments": [{"$count": "count"}],
                "car_type_distribution": [
                    {"$group": {"_id": "$car_type", "count": {"$sum": 1}}}
                ],
                "severity_distribution": [
                    {"$group": {"_id": "$severity", "count": {"$sum": 1}}}
                ],
                "average_cost": [
                    # Calculate avg of (min+max)/2 for each doc, then avg of that
                    {"$project": {
                        "avg_cost": {"$avg": ["$estimated_cost.min_cost", "$estimated_cost.max_cost"]}
                    }},
                    {"$group": {"_id": None, "avg_value": {"$avg": "$avg_cost"}}}
                ]
            }}
        ]

        results_list = list(mongo.db.history.aggregate(pipeline))
        results = results_list[0] if results_list else {
            "total_assessments": [{"count": 0}],
            "car_type_distribution": [],
            "severity_distribution": [],
            "average_cost": [{"avg_value": 0}]
        }
        
        # Format response safely avoiding index errors
        stats = {
            "total_assessments": results["total_assessments"][0]["count"] if results.get("total_assessments") and len(results["total_assessments"]) > 0 else 0,
            "car_type_distribution": {item["_id"]: item["count"] for item in results.get("car_type_distribution", [])},
            "severity_distribution": {item["_id"]: item["count"] for item in results.get("severity_distribution", [])},
            "average_cost": round(results["average_cost"][0]["avg_value"], 2) if results.get("average_cost") and len(results["average_cost"]) > 0 and results["average_cost"][0].get("avg_value") is not None else 0
        }

        return jsonify(stats), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/analytics/summary", methods=["GET"])
@jwt_required()
def get_analytics_summary():
    current_user_id = get_jwt_identity()
    
    try:
        # Re-use Pipeline (Same as get_analytics)
        pipeline = [
            {"$match": {"user_id": str(current_user_id)}},
            {"$facet": {
                "total_assessments": [{"$count": "count"}],
                "car_type_distribution": [
                    {"$group": {"_id": "$car_type", "count": {"$sum": 1}}}
                ],
                "severity_distribution": [
                    {"$group": {"_id": "$severity", "count": {"$sum": 1}}}
                ],
                "average_cost": [
                    {"$project": {
                        "avg_cost": {"$avg": ["$estimated_cost.min_cost", "$estimated_cost.max_cost"]}
                    }},
                    {"$group": {"_id": None, "avg_value": {"$avg": "$avg_cost"}}}
                ]
            }}
        ]

        results_list = list(mongo.db.history.aggregate(pipeline))
        results = results_list[0] if results_list else {
            "total_assessments": [{"count": 0}],
            "car_type_distribution": [],
            "severity_distribution": [],
            "average_cost": [{"avg_value": 0}]
        }
        
        # Format stats for AI safely
        stats = {
            "total_assessments": results["total_assessments"][0]["count"] if results.get("total_assessments") and len(results["total_assessments"]) > 0 else 0,
            "car_type_distribution": {item["_id"]: item["count"] for item in results.get("car_type_distribution", [])},
            "severity_distribution": {item["_id"]: item["count"] for item in results.get("severity_distribution", [])},
            "average_cost": round(results["average_cost"][0]["avg_value"], 2) if results.get("average_cost") and len(results["average_cost"]) > 0 and results["average_cost"][0].get("avg_value") is not None else 0
        }

        # Generate Summary
        summary = generate_analytics_summary(stats)
        
        return jsonify({"summary": summary}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------------------------------------------------
# STEP 9: MULTI-IMAGE ANALYSIS
# ---------------------------------------------------------
@app.route('/api/analyze_assessment', methods=['POST'])
@jwt_required(optional=True) 
def analyze_assessment():
    if 'images' not in request.files:
        return jsonify({'error': 'No images uploaded'}), 400

    files = request.files.getlist('images')
    if not files or files[0].filename == '':
        return jsonify({'error': 'No selected files'}), 400

    # Aggregation Variables
    car_types = []
    severities = []
    all_damaged_parts = set()
    image_results = []
    
    try:
        from collections import Counter
        
        for file in files:
            # Save temp file
            filename = str(uuid.uuid4()) + ".jpg"
            filepath = os.path.join(tempfile.gettempdir(), filename)
            file.save(filepath)

            try:
                # 1. Car Detection
                img = preprocess_image(filepath)
                car_pred = car_model.predict(np.array([img]))[0]
                car_index = np.argmax(car_pred)
                car_label = car_labels[str(car_index)]
                car_types.append(car_label)

                # 2. Severity
                sev_pred = severity_model.predict(np.array([img]))[0]
                # labels = ["minor", "moderate", "severe"] # Defined in predict_severity, reusing here
                sev_labels = ["minor", "moderate", "severe"]
                sev_label = sev_labels[np.argmax(sev_pred)]
                severities.append(sev_label)

                # 3. Damage Detection (YOLO)
                result = extractor.extract(filepath)
                distinct_parts = result.get("damaged_parts", [])
                all_damaged_parts.update(distinct_parts)

                # 4. Upload to Cloudinary (Original & Annotated)
                # Upload original
                upload_result = upload_image(filepath) # Returns string URL or None in current impl? 
                # Checking upload_image impl in imports utils.cloudinary_helper
                # It returns the secure_url string directly based on usage in other routes
                original_url = upload_result 
                
                # Create annotated image for upload
                # We need to visualize it first
                preds = result.get("raw_predictions")
                annotated_filename = "annotated_" + filename
                annotated_path = os.path.join(tempfile.gettempdir(), annotated_filename)
                extractor.visualize(filepath, preds, annotated_path)
                
                annotated_url = upload_image(annotated_path)

                # Cleanup annotated
                if os.path.exists(annotated_path): os.remove(annotated_path)

                image_results.append({
                    "original_url": original_url,
                    "annotated_url": annotated_url,
                    "car_type": car_label,
                    "severity": sev_label,
                    "damaged_parts": list(distinct_parts)
                })
            
            finally:
                 # Clean up temp file
                if os.path.exists(filepath): os.remove(filepath)

        # --- Aggregation Logic ---
        
        # Car Type: Majority Vote
        if car_types:
            final_car_type = Counter(car_types).most_common(1)[0][0]
        else:
            final_car_type = "Unknown"

        # Severity: Max Severity (Severe > Moderate > Minor)
        severity_order = {'severe': 3, 'moderate': 2, 'minor': 1, 'unknown': 0}
        if severities:
            final_severity = max(severities, key=lambda x: severity_order.get(x, 0))
        else:
            final_severity = "unknown"

        # Damaged Parts: Union of all parts
        final_damage_list = list(all_damaged_parts)
        # Create a dict for the cost estimator (expects {part: count})
        final_damage_dict = {part: 1 for part in final_damage_list}

        # 5. Cost Estimation
        estimated_cost = estimate_repair_cost(final_car_type, final_severity, final_damage_dict)

        # 6. AI Suggestions (Gemini)
        # suggestions = generate_repair_suggestions(...) # Optional, can be done if needed

        response_data = {
            "car_type": final_car_type,
            "severity": final_severity,
            "damaged_parts": final_damage_list,
            "estimated_cost": estimated_cost,
            "image_results": image_results
        }

        return jsonify(response_data), 200

    except Exception as e:
        print(f"Error in multi-image analysis: {str(e)}")
        return jsonify({'error': str(e)}), 500

# ---------------------------------------------------------
# RUN SERVER
# ---------------------------------------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)