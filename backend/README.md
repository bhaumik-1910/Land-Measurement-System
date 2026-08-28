# ⚙️ SLMSS Backend - Management Server

This is the Node.js / Express backend service for the **Smart Land Measurement & Survey System (SLMSS)**.

---

## 🛠️ Tech Stack
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js 5
- **Database:** MongoDB + Mongoose
- **AI Engine:** Groq Cloud (`llama-3.3-70b-versatile`)
- **Authentication:** JWT, Bcrypt.js, Google Auth Library (`OAuth2Client`)
- **File Storage:** Multer (Local disk storage)
- **PDF Generation:** PDFKit

---

## 🔌 API Endpoints Reference

### 🔑 Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new user (`name`, `email`, `password`, `role`)
- `POST /api/auth/login` - Authenticate with email and password
- `POST /api/auth/google` - One-tap Google OAuth 2.0 verification

### 🌾 Land Measurement Records (`/api/land`)
- `GET /api/land/public-stats` - Public analytics and stats for the landing page
- `POST /api/land/` - Create a new plot record with document uploads (`protect`)
- `GET /api/land/my-lands` - Fetch measurement history for the authenticated user (`protect`)
- `GET /api/land/:id` - Fetch single land parcel details (`protect`)
- `DELETE /api/land/:id` - Remove land record (`protect`)

### 🤖 AI Crop Recommendations (`/api/ai`)
- `POST /api/ai/analyze-crops` - Query Groq LLaMA 3.3 70B for location & area-specific crop suitability

### 🛡️ Admin Governance (`/api/admin`)
- `GET /api/admin/lands` - Fetch all submitted land records (`protect`, `admin`)
- `PATCH /api/admin/lands/:id/status` - Update approval status: `approved` | `rejected` | `pending` (`protect`, `admin`)
- `GET /api/admin/analytics` - System metrics, user counts & parcel statistics (`protect`, `admin`)
- `GET /api/admin/users` - Fetch list of registered surveyors (`protect`, `admin`)
- `DELETE /api/admin/users/:id` - Delete surveyor account (`protect`, `admin`)
- `PATCH /api/admin/users/:id/lock` - Lock / unlock user account (`protect`, `admin`)

---

## ⚙️ Environment Configuration (`.env`)

Create a `.env` file in the root of the `backend/` folder:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GROQ_API_KEY=your_groq_api_key
```

---

## 🚦 Quick Start

```bash
# Install dependencies
npm install

# Run in development mode (with nodemon)
npm run dev

# Run in production mode
npm start
```

---

<div align="center">
  <p>Made with ❤️ by Bhaumik Kothiya</p>
</div>