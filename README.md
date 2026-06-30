# Tutors Academy

**Tutors Academy** is a modern MERN stack web application that connects parents/students with tutors. The platform features a premium, responsive user interface with complete dark and light mode theme support, advanced multi-field search logic, and real-time messaging.

---

## Key Features

### 🎨 Premium UI & Styling Principles
- **Dual-Theme Support**: Sleek, high-contrast dark theme (default) and clean, readable light theme togglable via the Navbar (choices persisted in `localStorage`).
- **Glassmorphism Design**: High-end layouts featuring subtle glass-blurs, transparent surface cards, gradient action buttons, and outfit typography.
- **Single-Screen Layouts**: Locks main viewport scrollbars on search and message dashboards, scrolling results and chat bubbles internally.

### 🔍 Advanced Search Functionality
- **Multi-Field Queries**: Searches tutors by name, city, state, subject, or class. Searches students by name, subject, class, syllabus, or preferred tutor.
- **Conditional Type Casting**: Safe numeric casting for `class` searches on MongoDB to prevent query casting errors.
- **Immediate Triggering**: Fast `onKeyDown` (Enter) and click search triggers, coupled with a `400ms` debounce auto-search.

### 💬 Real-Time Messaging System
- **Redirects on Start**: Seamlessly creates new conversations from search card clicks and forwards users directly to the chat context without reloading the page.
- **Automatic Discarding**: Empty conversations are hidden from the sidebar until a message is sent.
- **Outbox/Inbox Bubble Alignment**: Correctly checks authentication parameters to align outgoing chat bubbles to the right and incoming bubbles to the left.

### 🔒 Security & Profile Details
- **Profile Details**: Sleek dashboard profile viewer for user account credentials.
- **Change Password**: Modal form allowing users to securely update their password, validated against stored hashes.

---

## Tech Stack

- **Frontend**: React.js, Vanilla CSS, React Router DOM, Axios
- **Backend**: Node.js, Express.js, JWT Cookie Authentication, Express Sessions
- **Database**: MongoDB (Mongoose schemas)

---

## Directory & Setup

### Environment Variables

#### 1. Backend config (`/backend/.env`)
Create a `.env` file in the `/backend` folder using [.env.example](file:///c:/Users/HARSHA/Documents/MyGit/Tutors_Academy/.env.example):
```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
production=false
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
NODE_ENV=development
BACKEND_URL=http://localhost:5000
```

#### 2. Frontend config (`/my-react-app/.env`)
Create a `.env` file in the `/my-react-app` folder using [my-react-app/.env.example](file:///c:/Users/HARSHA/Documents/MyGit/Tutors_Academy/my-react-app/.env.example):
```env
REACT_APP_BACKEND_URL=http://localhost:5000
```

---

## Installation & Running

1. **Clone the Repository**
   ```bash
   git clone https://github.com/harsha4p28/academy.git
   cd academy
   ```

2. **Run Backend Server**
   ```bash
   cd backend
   npm install
   npm start
   ```

3. **Run Frontend Client**
   ```bash
   cd my-react-app
   npm install
   npm start
   ```
