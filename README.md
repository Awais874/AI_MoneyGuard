 AI-MoneyGuard
Full Stack AI-Powered Fraud Detection Platform
AI-MoneyGuard is a full-stack AI-powered fraud detection platform built with Next.js, FastAPI, and PostgreSQL. It uses a Random Forest machine learning model trained on 6.3 million real financial transactions from the PaySim dataset, achieving 88% fraud recall. The backend is built with Python FastAPI featuring JWT authentication, SQLAlchemy ORM, and Pandas analytics API. The frontend is built with Next.js 16 and Tailwind CSS, featuring a real-time transaction dashboard, fraud/clean badges, and interactive charts with Recharts. The project covers the full stack — authentication, REST API, database, machine learning, and a modern responsive UI.

🖥️ Frontend — Next.js + Tailwind CSS
Next.js 16  ·  Tailwind CSS  ·  Recharts  ·  Axios  ·  App Router
•	Login & Register pages with JWT token handling
•	Protected dashboard with persistent sidebar layout
•	Real-time transaction feed with Fraud/Clean color badges
•	Analytics page with Pie chart and Line chart
•	Shared layout using Next.js Route Groups (protected)
•	Fully responsive dark theme UI
________________________________________
⚙️ Backend — FastAPI + Python + PostgreSQL
FastAPI  ·  SQLAlchemy  ·  PostgreSQL 17  ·  JWT  ·  bcrypt  ·  Pydantic
•	REST API with auto docs at /docs
•	JWT authentication with bcrypt password hashing
•	SQLAlchemy ORM with PostgreSQL
•	Protected routes using Depends() middleware
•	Pandas-powered analytics API
•	ML model integration via joblib
________________________________________
🤖 Machine Learning — Random Forest
scikit-learn  ·  Pandas  ·  joblib  ·  PaySim Dataset  ·  6.3M transactions
Metric	Value
Algorithm	Random Forest (100 trees)
Dataset	PaySim — 6,362,620 transactions
Fraud Recall	88% — catches 88 out of 100 fraud cases
Fraud Precision	80%
F1-Score	0.84
Old rule detection	~0% (amount > 10,000)
ML detection	88%
Key fraud signals the model learned:
•	Account completely drained to zero
•	Money disappearing from destination account
•	Large TRANSFER and CASH_OUT transactions
________________________________________
✨ Features
•	🔐 Secure register & login with JWT + bcrypt
•	💳 Create, view, delete transactions
•	🤖 Real-time ML fraud prediction on every transaction
•	📊 Analytics dashboard — pie chart + line chart
•	🎨 Dark theme UI with persistent sidebar
•	🔒 All routes protected with JWT middleware

 Tech Stack
Layer	Technology
Frontend	Next.js 16, Tailwind CSS, Recharts, Axios
Backend	Python 3.11, FastAPI, SQLAlchemy
Database	PostgreSQL 17
ML	scikit-learn, Pandas, joblib, Random Forest

 Getting Started
Backend Setup
git clone https://github.com/Awais874/AI_MoneyGuard.git
cd AI_MoneyGuard/backend

python -m venv venv
venv\Scripts\activate

python -m pip install fastapi uvicorn sqlalchemy psycopg2-binary python-dotenv passlib bcrypt==4.0.1 python-jose[cryptography] pydantic[email] pandas scikit-learn joblib
Create .env file:
SECRET_KEY=mySecretKey123
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=postgresql+psycopg2://postgres:yourpassword@localhost:5433/aimoneyguard
python -m uvicorn main:app --reload
API docs available at: http://127.0.0.1:8000/docs

Frontend Setup
cd AI_MoneyGuard/frontend
npm install
npm run dev
Frontend available at: http://localhost:3000

ML Model Setup
1.	Download PaySim dataset from Kaggle
2.	Place CSV in backend/ml/
3.	Train the model:
cd backend
python ml/train.py
Training takes ~5-10 minutes. Model saved to backend/ml/fraud_model.pkl.
________________________________________
📁 Project Structure
AI-MoneyGuard/
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── database.py              # PostgreSQL connection
│   ├── models/
│   │   ├── user.py              # User table
│   │   └── transaction.py       # Transaction table
│   ├── schemas/
│   │   ├── user_schema.py       # Pydantic validation
│   │   └── transaction_schema.py
│   ├── routers/
│   │   ├── auth.py              # Register & Login
│   │   ├── transactions.py      # CRUD + ML prediction
│   │   └── analytics.py         # Pandas analytics
│   ├── utils/
│   │   └── auth_utils.py        # JWT middleware
│   └── ml/
│       ├── train.py             # Model training script
│       ├── explore.py           # Dataset exploration
│       └── fraud_model.pkl      # Trained model
└── frontend/
    └── src/app/
        ├── (protected)/
        │   ├── layout.js        # Shared sidebar layout
        │   ├── dashboard/       # Transaction feed
        │   └── analytics/       # Charts page
        ├── components/
        │   └── sidebar.js       # Persistent sidebar
        ├── login/
        ├── register/
        └── lib/
            └── api.js           # Axios base config
________________________________________
📡 API Endpoints
Auth
Method	Endpoint	Description
POST	/api/auth/register	Register new user
POST	/api/auth/login	Login → get JWT token
Transactions
Method	Endpoint	Description
POST	/api/transactions/	Create + ML fraud check
GET	/api/transactions/	Get all transactions
DELETE	/api/transactions/{id}	Delete transaction
Analytics
Method	Endpoint	Description
GET	/api/analytics/summary	Fraud/clean stats
GET	/api/analytics/by-date	Transactions by date
