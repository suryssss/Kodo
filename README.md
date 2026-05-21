# 💻 Kodo - Next-Gen Collaborative Coding Platform

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs)
![WebSockets](https://img.shields.io/badge/WebSockets-Real--Time-blue)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)
![Gemini AI](https://img.shields.io/badge/Google%20Gemini-AI%20Features-purple)
![Status](https://img.shields.io/badge/Status-Active-success)

**Kodo** is a real-time collaborative coding system that allows multiple developers to join a shared room and write, execute, and debug code together with instant synchronization. 

It is designed to simulate real-world collaborative problem-solving scenarios, going beyond simple screen sharing by providing an integrated terminal, real-time presence tracking, and advanced **AI-powered assistance** using the Google Gemini API.

---

## ✨ Key Features

### 🔄 Real-Time Collaboration
- **Sub-millisecond Code Synchronization:** Built on `socket.io` to ensure perfectly synchronized states across all participants.
- **Room-Based Isolation:** Unique links for isolated coding sessions.
- **Host Privileges:** The room creator can lock the room to prevent new users from joining and modifying the code.
- **State Rehydration:** If a user drops connection and reconnects, the backend instantly restores their editor and terminal states.

### 🧠 AI-Powered Capabilities (Google Gemini)
Kodo deeply integrates LLM workflows to supercharge the learning and debugging experience:
- **Smart Error Debugger:** Whenever a code execution fails, Kodo automatically intercepts the runtime error and uses Gemini to present a human-readable explanation alongside a 1-click **"Apply AI Fix"** button that patches the code for everyone in the room.
- **Code Explain & Review:** Dedicated AI panel tabs allow you to get line-by-line explanations or complex time/space complexity reviews of your current codebase.
- **Session Summarizer:** At the end of a session, click "Summarize" to generate an AI report detailing execution statistics, bugs encountered, and what was learned.

### ▶️ Integrated Code Execution
- **Multi-Language Support:** Write and run JavaScript, TypeScript, Python, Java, C++, Go, and Rust.
- **Piston API Integration:** Code is safely executed in isolated containers on the backend and streamed instantly to the frontend terminal.
- **Interactive Terminal:** Resizable output console with STDIN support for interactive programs.

### 💾 Persistence & History
- **Execution History:** Every code execution, including its output and AI feedback, is logged to a PostgreSQL database for permanent record keeping.
- **Prisma ORM:** Robust database schema handling.

---

## 🏗️ System Architecture

```mermaid
graph TD;
    Client[Next.js Client + Monaco Editor] <-->|WebSockets| Server[Node.js + Express + Socket.io];
    Server -->|Code Execution| Piston[Piston Execution Engine];
    Server -->|Read/Write History| DB[(PostgreSQL Database)];
    Server <-->|AI Prompts & Auto-Fixes| Gemini[Google Gemini API];
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database
- Google Gemini API Key

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/Kodo.git
cd Kodo
```

### 2. Setup the Backend Server
```bash
cd server
npm install

# Setup your environment variables
cp .env.example .env
```
Ensure your `server/.env` includes:
```env
DATABASE_URL="postgresql://user:pass@host/db"
GEMINI_API_KEY="your_google_gemini_api_key_here"
```
Initialize the database:
```bash
npx prisma generate
npx prisma migrate dev
```
Start the server:
```bash
npm run dev
```

### 3. Setup the Frontend Client
Open a new terminal window:
```bash
cd client
npm install
npm run dev
```

### 4. Code!
Navigate to `http://localhost:3000` in your browser. Create a new room, share the link with a friend, and start coding!

---

## 🛠️ Technology Stack

- **Frontend:** Next.js, React, Tailwind CSS, Tabler Icons
- **Editor:** Monaco Editor
- **Backend:** Node.js, Express, Socket.io
- **Database:** PostgreSQL, Prisma ORM
- **AI Integration:** Google Gemini API (`gemini-2.5-flash`)
- **Execution Environment:** JDoodle fallback

---

