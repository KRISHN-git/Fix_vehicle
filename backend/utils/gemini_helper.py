import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
GENAI_API_KEY = os.getenv("GEMINI_API_KEY")
if GENAI_API_KEY:
    genai.configure(api_key=GENAI_API_KEY)

def generate_repair_suggestions(car_type, severity, damaged_parts, estimated_cost):
    """
    Generates repair suggestions using Gemini API.
    """
    if not GENAI_API_KEY:
        return "Gemini API Key is missing. Please add GEMINI_API_KEY to your .env file."

    try:
        model = genai.GenerativeModel('gemma-3-4b-it')

        # Handle damaged_parts whether it's a list (multi-image) or dict (single-image)
        if isinstance(damaged_parts, dict):
            parts_str = ', '.join(f"{p} ({c})" for p, c in damaged_parts.items())
        elif isinstance(damaged_parts, list):
            parts_str = ', '.join(damaged_parts)
        else:
            parts_str = str(damaged_parts)

        prompt = f"""
        You are an expert vehicle damage assessor and mechanic.
        Analyze the following vehicle damage report and provide a concise, actionable summary for the owner.

        **Vehicle Details:**
        - Type: {car_type}
        - Overall Severity: {severity}
        - Damaged Parts: {parts_str}
        - Estimated Repair Cost: ₹{estimated_cost.get('min_cost', 0)} - ₹{estimated_cost.get('max_cost', 0)}

        **Please provide:**
        1. **Urgency Assessment:** Is it safe to drive? (Yes/No/Caution).
        2. **Repair vs Replace:** For the damaged parts, what is the likely course of action?
        3. **Expert Tip:** One money-saving or safety tip relevant to this specific damage.
        4. **Estimated Time:** Rough estimate of days in the shop.

        Keep the tone professional yet reassuring. Format output in Markdown.
        """

        response = model.generate_content(prompt)
        return response.text

    except Exception as e:
        print(f"Gemini Error: {e}")
        return None

def generate_analytics_summary(stats):
    """
    Generates a summary of the analytics data using Gemini.
    """
    if not GENAI_API_KEY:
        return "Gemini API Key is missing."

    try:
        model = genai.GenerativeModel('gemma-3-4b-it')
        
        prompt = f"""
        You are a Data Analyst for a Vehicle Repair Shop. 
        Interpret the following analytics data and provide a strategic summary for the dashboard user (Shop Manager or Car Owner).

        **Analytics Data:**
        - Total Assessments Processed: {stats['total_assessments']}
        - Average Repair Cost: ₹{stats['average_cost']}
        - Car Type Distribution: {stats['car_type_distribution']}
        - Damage Severity Distribution: {stats['severity_distribution']}

        **Please provide a brief 3-4 sentence summary including:**
        1. **Trend Analysis:** What is the most common car type and severity?
        2. **Financial Insight:** Is the average cost high or low?
        3. **Actionable Advice:** What should the user focus on?

        Keep it professional, concise, and easy to read.
        """
        
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Gemini Analytics Error: {e}")
        return "Failed to generate summary."

def get_chatbot_response(user_message):
    try:
        model = genai.GenerativeModel('gemma-3-4b-it')
        
        system_prompt = """
        You are the intelligent assistant for 'DamageDetector', an AI-powered vehicle damage assessment application.
        
        **Project Overview:**
        DamageDetector allows users to upload images of damaged vehicles to get instant analysis and repair cost estimates.
        
        **Key Features:**
        1. **Multi-Image Upload:** Users can upload multiple angles (front, side, rear) for a complete check.
        2. **Car Type Detection:** Automatically identifies if the car is a Sedan, SUV, Hatchback, etc.
        3. **Severity Analysis:** Classifies damage as Minor, Moderate, or Severe.
        4. **Damage Detection:** Uses YOLOv11 to draw bounding boxes around specific damage (Scratches, Dents, Broken Glass).
        5. **Cost Estimation:** Provides an estimated repair cost range in INR (₹).
        6. **AI Advice:** Gives maintenance tips and a summary using Google Gemini.
        7. **Analytics:** Tracks history and shows charts of damage trends.
        
        **Tech Stack:**
        - Frontend: React (Vite), Tailwind CSS, Chart.js
        - Backend: Python (Flask), MongoDB
        - AI/ML: TensorFlow (Keras), YOLO (Ultralytics), Google Gemini API
        
        **Your Goal:**
        Answer user questions about the project, how to use it, or technical details based on the info above.
        Be helpful, concise, and friendly.
        """
        
        chat = model.start_chat(history=[
            {"role": "user", "parts": [system_prompt]},
            {"role": "model", "parts": ["Understood. I am ready to assist users with DamageDetector."]}
        ])
        
        response = chat.send_message(user_message)
        return response.text
        
    except Exception as e:
        print(f"Chatbot Error: {e}")
        return "I'm having trouble connecting to the AI right now. Please try again later."
