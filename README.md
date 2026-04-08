# 🚗 AI Vehicle Damage Inspector

A comprehensive AI-powered web application for assessing vehicle damage, estimating repair costs, and providing actionable repair advice.

## ✨ Key Features

### 1. 🖼️ Multi-Image Upload & Assessment
- Upload multiple images of a vehicle (front, side, rear, etc.) for a holistic analysis.
- The system aggregates findings from all images to provide a single, accurate report.

### 2. 🔍 Advanced AI Analysis Pipeline
- **Car Type Detection:** Identifies the vehicle body type (Sedan, SUV, Hatchback, etc.) using Deep Learning.
- **Severity Analysis:** Classifies damage severity as **Minor**, **Moderate**, or **Severe**.
- **Damage Detection:** Uses **YOLO (You Only Look Once)** to pinpoint specific damaged parts (Bumper, Hood, Door, etc.) with bounding boxes.

### 3. 💰 Intelligent Cost Estimation
- Provides an estimated repair cost range (in ₹ INR) based on the detected car type, severity, and specific damaged parts.
- Breakdowns include labor and parts estimates.

### 4. 🤖 AI Expert Advice (Gemini Integration)
- Generates a professional, human-readable summary and action plan using **Google Gemini AI**.
- Offers second opinions and maintenance tips based on the damage analysis.

### 5. 📊 Analytics Dashboard
- visualizes your assessment history.
- **Charts:**
    - Vehicle Type Distribution (Pie Chart).
    - Damage Severity Trends (Bar Chart).
- **Key Metrics:** Total assessments conducted and average repair costs.

### 6. 📜 Assessment History
- acccess a full history of all past assessments.
- Review past reports, images, and cost estimates at any time.

---

## 🛠️ Tech Stack

### Frontend
- **React.js (Vite)** - Fast, modern UI framework.
- **Tailwind CSS** - For beautiful, responsive styling.
- **Chart.js & React-Chartjs-2** - For data visualization.
- **Axios** - For API communication.

### Backend
- **Flask (Python)** - Robust backend API.
- **TensorFlow / Keras** - For Car Type and Severity classification models.
- **YOLO (Ultralytics)** - For Object Detection (Damage localization).
- **MongoDB** - Database for storing user history and analytics data.
- **Cloudinary** - For secure image storage.
- **Google Gemini API** - For generative AI advice.

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js & npm
- Python 3.8+
- MongoDB (Local or Atlas)
- Cloudinary Account
- Google Gemini API Key

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/damage-detector.git
cd damage-detector
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Create a `.env` file in `/backend`:**
```env
MONGO_URI=mongodb://localhost:27017/damage_detector
JWT_SECRET_KEY=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_API_KEY=your_gemini_key
```

**Run the Server:**
```bash
python app.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 📖 Usage Guide

1.  **Register/Login:** Create an account to save your history.
2.  **Upload:** Go to the Dashboard and upload images of the damaged vehicle.
3.  **Analyze:** Click "Upload & Analyze" to start the AI pipeline.
4.  **View Results:**
    - **Step 1:** Confirm Vehicle Type.
    - **Step 2:** Review Severity Analysis.
    - **Step 3:** See specific damaged parts.
    - **Step 4:** Get the estimated repair cost.
5.  **Summary:** See the final consolidated report with AI advice.
6.  **Analytics:** Check the Analytics tab to see trends in your assessments.

---

## 🤝 Contributing
Contributions are welcome! Please fork the repository and submit a pull request.

## 📄 License
This project is licensed under the MIT License.
