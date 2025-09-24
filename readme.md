# 🤖 SmartBot

SmartBot is a chatbot system built with **Node.js**, **Dialogflow**, and **MongoDB Atlas**. It provides intelligent and context-aware conversations by integrating **custom intent recognition**, **conversation flows**, and **session/context management**.

---

## 🚀 Features

- **Natural Language Understanding (NLU)** using **Dialogflow**
- **Context-aware conversations** stored and managed in **MongoDB Atlas**
- **Custom intent recognition** for domain-specific responses
- **API integration** for external services and advanced features
- **Session persistence** across multiple user interactions
- **Scalable backend** with Node.js and Express

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express
- **Database:** MongoDB Atlas
- **NLP Engine:** Dialogflow
- **Session Management:** Custom context handling with MongoDB
- **API Layer:** RESTful APIs for integration and extension

---

## 📂 Project Structure

```bash
SmartBot/
│── src/
│   ├── config/        # Database and environment configs
│   ├── controllers/   # Bot logic and conversation flows
│   ├── models/        # MongoDB models (session, context, users)
│   ├── routes/        # API endpoints
│   ├── services/      # Dialogflow + external service integrations
│   └── utils/         # Helper functions
│
│── .env.example       # Example environment variables
│── package.json       # Dependencies & scripts
│── README.md          # Project documentation
``````

## ⚙️ Installation & Setup

### Clone the repository
```bash
git clone https://github.com/your-username/smartbot.git
cd smartbot
```
MONGO_URI=your_mongodb_atlas_connection
DIALOGFLOW_PROJECT_ID=your_project_id
DIALOGFLOW_PRIVATE_KEY=your_private_key
DIALOGFLOW_CLIENT_EMAIL=your_service_account_email
PORT=5000

## Run the app
npm run start

