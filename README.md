# 🚀 Live Coding Platform

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs)
![WebSockets](https://img.shields.io/badge/WebSockets-Real--Time-blue)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![Monaco Editor](https://img.shields.io/badge/Monaco-Editor-orange)
![Status](https://img.shields.io/badge/Status-Active-success)

A real-time collaborative coding platform that allows multiple users to join a shared room and write, view, and execute code together with instant synchronization.

This project focuses on **real-time state consistency, connection lifecycle handling, and backend-driven synchronization**, rather than UI complexity.

---

## 📌 Problem Statement

Collaborative problem-solving using screen sharing or messaging often leads to:
- delayed feedback
- inconsistent code states
- poor real-time collaboration

Building a reliable collaborative editor is challenging due to:
- concurrent edits
- user disconnects and reconnects
- late joiners needing the latest state
- maintaining a single source of truth

This project was built to address these challenges at a system level.

---

## ✨ Features

- 🔄 **Real-Time Code Synchronization** using WebSockets
- 🏠 **Room-Based Collaboration** with isolated state per room
- 👥 **User Presence Tracking** (join / leave handling)
- 🧠 **Backend as Source of Truth** for consistency
- 💻 **Language-Aware Sessions** across participants
- ▶️ **Remote Code Execution** via Piston API
- 🔁 **Reconnect & State Rehydration** support

---

## 🏗️ System Architecture

```text
Client (Next.js + Monaco)
        |
        |  WebSockets
        v
Realtime Server (Node.js)
        |
        |  Execution Requests
        v
   Piston Code Execution API
