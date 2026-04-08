
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

uri = os.getenv("MONGO_URI")
print(f"Testing connection to: {uri}")

try:
    client = MongoClient(uri, serverSelectionTimeoutMS=5000)
    # Force a connection
    client.server_info()
    print("SUCCESS: MongoDB Connected!")
    
    db = client.damage_detector
    print(f"Database: {db.name}")
    
    # Test User Collection
    count = db.users.count_documents({})
    print(f"User count: {count}")
    
except Exception as e:
    print(f"ERROR: Failed to connect to MongoDB.")
    print(e)
