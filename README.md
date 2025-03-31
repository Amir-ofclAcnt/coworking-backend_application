// 📁 README.md
# Coworking Booking Platform – Backend

## 🧠 Beskrivning
Node.js/Express backend med JWT-autentisering, realtidsnotifikationer (Socket.io), Redis-cache, adminhantering, och bokningssystem.

## 🚀 Kom igång
```bash
git clone https://github.com/dittnamn/coworking-backend.git
cd coworking-backend
npm install
cp .env.example .env
npm run dev
```

## 🔐 API
| Metod | URL             | Roll       | Beskrivning             |
|-------|------------------|------------|--------------------------|
| POST  | /api/auth/register | Alla     | Registrera ny användare |
| POST  | /api/auth/login    | Alla     | Logga in och få JWT     |
| GET   | /api/rooms         | Alla     | Lista rum (Redis-cache) |
| POST  | /api/rooms         | Admin    | Skapa rum               |
| PUT   | /api/rooms/:id     | Admin    | Uppdatera rum           |
| DELETE| /api/rooms/:id     | Admin    | Ta bort rum             |
| GET   | /api/bookings      | User/Admin | Se bokningar         |
| POST  | /api/bookings      | User/Admin | Skapa bokning        |
| PUT   | /api/bookings/:id  | User/Admin | Ändra bokning         |
| DELETE| /api/bookings/:id  | User/Admin | Ta bort bokning       |

## 🧠 Teknologi
- Node.js / Express.js
- MongoDB + Mongoose
- Socket.io
- Redis
- JWT + Bcrypt
- Helmet + Rate limiting
- Winston (loggning)

## 📬 WebSocket Events
- `bookingUpdate`: när en bokning skapas, ändras eller tas bort

## ✅ Klar att deploya till t.ex. Render, Railway, Heroku
