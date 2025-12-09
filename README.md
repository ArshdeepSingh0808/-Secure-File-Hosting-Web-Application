# Secure File Hosting Web Application

Student Name : Arshdeep Singh
Student Id : 229568260
Student Email : arshdeepsingh08@algomau.ca


## Requirements
- Node.js (v18+ recommended)
- MongoDB running locally (e.g., `mongod`)

## Setup

### 1. Backend
```bash
cd File-hosting
npm install

Create .env file:

PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/secure_file_hosting. // or your own mongodb connection string
(Download mongodb compass if not available and connect to the localhost connection or add it if not available)
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:4000
MAX_FILE_SIZE_MB=20
2. Run server

cd File-hosting
npm run start   # or: npm start
This will:

Connect to MongoDB.

Serve backend APIs at http://localhost:4000/api/....

Serve frontend files from frontend/ at http://localhost:4000.

3. Using the app
Click on the localhost path from the console and open it (copy and paste if not clickable after starting the server)

Leads to login page automatically , use the option to switch to register page and register yourself and enjoy the experience of file-hosting.

Register a new user.

Login at http://localhost:4000/login.html.

After login, you’ll be redirected to upload.html.

Upload files (choose privacy: public / private).

View and manage your files at my-files.html:

Download

Delete (only your own)

Copy share link for private files.

View all public files in downloads.html (any user can download them).

Logout using “Logout” button in the header.