# EduConnect

EduConnect is a premium, full-stack educational platform designed to connect students with verified professors. It offers course catalogs, educational posts, chat spaces, notifications, and classroom schedules.

## 🚀 Technology Stack
- **Frontend**: React.js (Vite), Tailwind CSS, React Router, Axios, React Icons, Framer Motion
- **Backend**: Node.js, Express.js, JWT Authentication, Socket.io, Multer, bcrypt
- **Database**: MongoDB, Mongoose

---

## 📁 Project Structure

```
EduConnect/
├── backend/
│   ├── config/          # DB config settings
│   ├── controllers/     # MVC controller handlers
│   ├── middleware/      # JWT protection, role checks, file upload configurations
│   ├── models/          # Mongoose database schemas
│   ├── routes/          # Express route boundaries
│   ├── socket/          # Socket.io events
│   ├── uploads/         # Local folder storing resumes/attachments
│   ├── utils/           # Notifications dispatcher helpers
│   ├── server.js        # Main server entry
│   └── .env             # Backend variables
├── frontend/
│   ├── src/
│   │   ├── assets/      # Graphical materials
│   │   ├── components/  # Reusable elements
│   │   ├── context/     # Auth, Socket, Notification, and Theme contexts
│   │   ├── layouts/     # Sidebar structures
│   │   ├── pages/       # Dashboard and index views
│   │   ├── services/    # Axios client configs
│   │   ├── styles/      # Typography
│   │   └── App.jsx      # Router mapping
│   └── .env             # Frontend variables
├── database/            # Seed helpers
└── package.json         # Workspace scripts manager
```

---

## 🔑 Environment Configuration

### Backend (`backend/.env`)
Create a `.env` file in the `backend/` folder:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/educonnect
JWT_SECRET=educonnect_super_secret_jwt_key_2026_safe
# Cloudinary Credentials (Optional - local storage will be used if left empty)
CLOUDINARY_NAME=
CLOUDINARY_KEY=
CLOUDINARY_SECRET=
```

### Frontend (`frontend/.env`)
Create a `.env` file in the `frontend/` folder:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 📦 Installation & Setup

1. **Install Dependencies**
   Run the following command at the root workspace directory to install all packages for both frontend and backend:
   ```bash
   npm run install-all
   ```

2. **Seed Mock Data**
   Pre-populate database with default admin, student, and teacher accounts by running:
   ```bash
   npm run seed --prefix backend
   ```

3. **Start the Platform**
   - **Backend**: `npm run dev:backend` (runs on `http://localhost:5000`)
   - **Frontend**: `npm run dev:frontend` (runs on `http://localhost:5173`)

---

## 🔒 Default Logins (Grading Credentials)
- **Student**: `student` / `student123`
- **Teacher**: `teacher` / `teacher123`
- **Admin**: `admin` / `admin123`

---

## 📡 REST API Documentation

### Authentication (`/api/auth`)
- `POST /register`: Registers user and creates initial profile database entry.
- `POST /login`: Logs in user, creates Session token, and returns JWT.
- `POST /logout`: Invalidates session.
- `POST /forgot-password`: Generates reset token (printed to server log).
- `POST /reset-password`: Resets credentials.

### Profiles
- `GET /student/profile` (Student only): Gets own profile.
- `PUT /student/profile` (Student only): Updates profile details and avatar.
- `GET /teachers`: Public search and filter parameters of verified professors.
- `GET /teachers/:userId`: Public lookup of professor profile.
- `PUT /teacher/profile` (Teacher only): Updates professor profile qualifications, days, and documents.

### Courses (`/api/courses`)
- `POST /`: Creates course (Teacher only).
- `GET /`: Lists all published courses.
- `GET /my`: Lists teacher's own created courses.
- `PUT /:id`: Edits course parameters.
- `DELETE /:id`: Deletes course.
- `PUT /:id/publish` & `PUT /:id/unpublish`: Toggles active view.

### Bookings (`/api/bookings`)
- `POST /`: Creates booking request (Student only).
- `GET /`: Lists bookings history (role-filtered).
- `PUT /:id/accept` / `PUT /:id/reject` (Teacher only): Approves/Declines booking.
- `PUT /:id/cancel` (Student only): Cancels pending slot.

### Chat & Meetings
- `POST /api/chat/message`: Sends private message with attachments.
- `GET /api/chat/messages/:receiverId`: Lists conversation logs.
- `POST /api/meetings`: Schedules a virtual meeting room (Teacher only).
- `GET /api/meetings`: Lists meetings (role-filtered).
- `PUT /api/meetings/:id`: Updates meeting status (e.g. Completed/Cancelled).
