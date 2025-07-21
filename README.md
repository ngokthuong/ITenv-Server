# 🛠️ ITenv Backend – Developer Environment Manager

A scalable, real-time backend system to manage developer environments efficiently. Built with Node.js, TypeScript, and Docker-ready for production.

---

## 🔧 Tech Stack

- 🧠 **Backend**: Node.js, TypeScript, Express
- 🗃️ **Database**: MongoDB (Mongoose ODM)
- ⚡ **Cache**: Redis
- 🔌 **Real-time**: Socket.IO
- 📦 **DevOps**: Docker, Docker Compose

---

## 🚀 Features

- ✅ JWT Authentication & Authorization  
- ✅ Environment CRUD APIs  
- ✅ Real-time updates via WebSockets (Socket.IO)  
- ✅ Redis Caching  
- ✅ Dockerized for easy deployment  
- ✅ Scalable project structure  
- ✅ Refactored and AI-enhanced structure  

---

## 📁 Project Structure

```bash
src/
  ├── api/               # Feature-specific groupings
  ├── config/            # Configuration (DB, Redis, etc.)
  ├── controllers/       # Express route handlers
  ├── enums/             # App-wide enums
  ├── helper/            # Helper functions
  ├── Logs/              # Logging system
  ├── middlewares/       # Auth, error handling, etc.
  ├── models/            # Mongoose schemas
  ├── routes/            # API route definitions
  ├── services/          # Business logic layer
  ├── socket/            # Real-time socket handlers
  ├── temp/              # Temporary/cache/generated data
  ├── types/             # TypeScript interfaces/types
  ├── utils/             # Utilities
  └── server.ts          # Main app entry point

``` 
## 🔌 Real-time via Socket.IO

- The system uses Socket.IO for real-time, bi-directional communication between server and clients. Example:

```ts
io.on('connection', (socket) => {
  socket.on('env:update', (data) => {
    io.emit('env:updated', data);
  });
});

```
## 🧪 Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ITenv.git
cd ITenv-Server
```
### 2. Install dependencies

```bash
yarn install
```
### 3. Setup environment variables
```bash 
cp .env.example .env
```
### 4. Run with Docker (Recommended)

```bash
docker-compose up -d
yarn start

```

## 📌 Sample APIs

### 🔐 Register – POST /api/accounts/register

```bash
{
  "email": "example@email.com",
  "password": "yourpassword",
  "username": "yourusername",
  "authenWith": 0
}
```

### 🔐 Login – POST /api/accounts/login

```bash
{
  "email": "example@email.com",
  "password": "yourpassword",
  "authenWith": 0
}
```

## 👨‍💻 Author
- TRINH NGOC THUONG
- GitHub: https://github.com/ngok-thuong
- Email: trinhngocthuong17523@gmail.com
- FE prj: https://github.com/duongthiu/ITenv-Client




