# Acadmy Backend

This is a simple Express.js backend for the Acadmy project.
It supports user registration and login with three roles:

- **admin** (email: admin12345@gmail.com, password `Admin@123`)
- **teachers** (warda12345@gmail.com, ahlam12345@gmail.com, nourhan12345@gmail.com) - password `Teacher@123`
- **students** (everyone else who signs up via `/register`)

## Setup

```bash
cd backend
npm install
npm start
```

The server listens on port 3000 by default.

## Endpoints

### POST /register
- Body JSON: `{ "email": "...", "password": "..." }`
- Creates a student account (unless email already exists).

### POST /login
- Body JSON: `{ "email": "...", "password": "..." }`
- Returns `{ message: 'Logged in', role: '<role>' }` on success.

### GET /ping
- Simple health check returning `pong`.
