# Expense Tracker – 3-Tier Web App

A clean, persistent **Expense Tracker** demonstrating a full **3-tier architecture** with real database storage.


## ✨ Features

- Add, edit, delete expenses
- Category filter (Food / Transport / Entertainment / Other)
- Live total calculation
- Data persists after refresh (saved in MySQL)
- Simple API key protection

## 🏗️ Architecture

**Presentation Tier** → Browser (HTML + CSS + JS)  
**Application Tier** → Node.js + Express REST API  
**Data Tier**     → MySQL database

## Quick Start

1. **Database**  
   Run in MySQL Workbench:
   ```sql
   CREATE DATABASE expenses_db;
   USE expenses_db;
   CREATE TABLE expenses (
     id INT AUTO_INCREMENT PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     amount DECIMAL(10,2) NOT NULL,
     category VARCHAR(100) NOT NULL,
     date DATE NOT NULL
   );

BackendBashcd backend
npm install
node server.js

Frontend
Open frontend/index.html with Live Server (VS Code) or run:Bashcd frontend
npx http-server

Visit: [http://localhost:8080](https://frontend-qjbc.onrender.com/)
