import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv

load_dotenv()

# Cloudinary Setup
# User will provide keys in .env
cloudinary.config(
  cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME'),
  api_key = os.getenv('CLOUDINARY_API_KEY'),
  api_secret = os.getenv('CLOUDINARY_API_SECRET'),
  secure = True
)

def upload_image(file_path, public_id=None):
    """
    Uploads an image to Cloudinary and returns the secure URL.
    """
    try:
        response = cloudinary.uploader.upload(file_path, public_id=public_id)
        return response['secure_url']
    except Exception as e:
        print(f"Cloudinary Upload Error: {e}")
        return None
