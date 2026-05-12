# ⚙️ SLMSS Backend - Management Server

This is the Node.js/Express backend for the **Smart Land Measurement & Survey System**.

## 🔌 API Endpoints

### Auth
- `POST /api/auth/register` - New user registration
- `POST /api/auth/login` - User authentication

### Land Records
- `POST /api/land/` - Create new measurement (with document upload)
- `GET /api/land/my-lands` - Get user's records
- `GET /api/land/:id` - Get specific record details
- `DELETE /api/land/:id` - Remove record

### Admin
- `GET /api/admin/lands` - All records for verification
- `PATCH /api/admin/lands/:id/status` - Approve/Reject land
- `GET /api/admin/analytics` - System-wide statistics
- `GET /api/admin/users` - User management

## 🛠️ Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Security**: JWT, Bcrypt
- **Storage**: Multer (Local disk storage)

## 🚦 Quick Start
```bash
npm install
npm start
```
**Developed with ❤️ for the Future of Agriculture & Urban Planning.**
<div align="center">
  <p>Made with ❤️ by Bhaumik Kothiya</p>
</div>