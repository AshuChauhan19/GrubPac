# Content Broadcasting System (Backend)

A Node.js/Express backend for educational content distribution with scheduling, rotation, and role-based access control.

## Tech Stack
- **Backend**: Node.js, Express.js (ES6 Modules)
- **Database**: MySQL (Sequelize ORM)
- **Authentication**: JWT, bcryptjs
- **File Upload**: Multer (Local Storage)

## Project Structure
```
src/
├── config/         # MySQL/Sequelize configuration
├── controllers/    # Business logic (ES6)
├── middlewares/    # Auth, RBAC, and Upload validation
├── models/         # Sequelize model definitions
├── routes/         # API endpoints
├── server.js       # Entry point
└── app.js          # Express app setup
uploads/            # Local storage for content files
```

## Setup Instructions

1. **Clone the repository** (or navigate to the project directory).
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=grubpac
   JWT_SECRET=your_secret_key
   NODE_ENV=development
   ```
4. **Run the Server**:
   - Development mode: `npm run dev`
   - Production mode: `npm start`

## API Documentation

### Auth Endpoints
- `POST /api/auth/register`: Register a new user (role: 'teacher' or 'principal').
- `POST /api/auth/login`: Authenticate and get JWT token.

### Content Endpoints (Teacher)
- `POST /api/content/upload`: Upload content (Multipart Form Data).
  - Fields: `title`, `subject` (required); `description`, `startTime`, `endTime`, `rotationDuration` (optional).
  - File: `file` (image only).
- `GET /api/content/my-content`: View status of own uploaded content.

### Content Endpoints (Principal)
- `GET /api/content/all`: View all uploaded content.
- `GET /api/content/pending`: View content awaiting approval.
- `PUT /api/content/review/:id`: Approve or Reject content.
  - Body: `{ "status": "approved" }` or `{ "status": "rejected", "rejectionReason": "..." }`.

### Public Broadcasting API
- `GET /api/broadcast/live/:teacherId`: Get currently active content for a teacher.
  - Query Param: `subject` (optional).
  - **Logic**: Returns approved content within the active time window, rotating based on `rotationDuration`.

## Business Logic
- **Scheduling**: Content only goes live if `approved` AND `currentTime` is within `[startTime, endTime]`.
- **Rotation**: Multiple items per subject loop continuously. The system calculates the active item based on elapsed time relative to the total duration of all items in that subject's rotation.
- **RBAC**: Principal can only review; Teacher can only upload/view own. Students access via public endpoints.

## Assumptions
- Each teacher's content is independent.
- `startTime` and `endTime` are mandatory for content to be "active".
- The rotation loop is synchronized across all clients based on server time.
