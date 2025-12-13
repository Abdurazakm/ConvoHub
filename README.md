ConvoHub

ConvoHub is a real-time chat application built with React, Socket.IO, Node.js, and MySQL. It allows users to register, log in, chat in public channels, and exchange private messages with other users. The app supports real-time messaging, online/offline status tracking, and persistent chat history.

Features

1. User Authentication

Register: Users can create an account with a unique username and password. Passwords are securely hashed using bcrypt.

Login: Users log in using their username and password. A session token is generated and stored to maintain authentication.

Persistent Sessions: Logged-in users stay authenticated even after refreshing the page via localStorage and session tokens.

2. Public Chat Rooms

Users can join predefined chat rooms:

General

Tech Talk

Random

Each room displays message history and real-time incoming messages.

Users can switch between rooms without losing previous messages.

3. Private Messaging

Users can start direct messages (DMs) with other users.

Private chats are stored in the database, so messages persist even after refreshing or logging in/out.

Both sender and receiver see messages in real-time.

4. Online/Offline User Status

The app displays all registered users along with their current status:

Online (green indicator)

Offline (gray indicator)

Users’ online status updates automatically when they connect or disconnect.

5. Real-Time Communication

Powered by Socket.IO:

Real-time room messages

Real-time private messages

Online/offline user updates

Users immediately see messages and status changes without refreshing.

6. Responsive UI

Built with React and Tailwind CSS.

Sidebar shows channels and users with status.

Main panel shows messages for the selected room.

Private messages open in a modal overlay.

Mobile-friendly design ensures usability on small screens.

7. Centralized API Calls

All HTTP API calls are centralized in `frontend/src/api.js` for better maintainability.

8. Persistent Message History

Public messages are stored in the public_messages table in MySQL.

Private messages are stored in the private_messages table.

Both room and private chat histories are loaded when the user opens the chat or refreshes the page.

Technology Stack

- **Frontend**: React.js, Vite, Tailwind CSS
- **Backend**: Node.js, Express, Socket.IO
- **Database**: MySQL (mysql2)
- **Authentication**: bcrypt, UUID session tokens
- **Real-time**: Socket.IO
  Project Structure

```
slack-chat/
├─ README.md
├─ backend/
│  ├─ server.js              # Small entry point
│  ├─ config/
│  │  └─ db.js               # Database configuration
│  ├─ routes/
│  │  └─ auth.routes.js      # Login/register routes
│  ├─ socket/
│  │  ├─ index.js            # Socket.IO setup
│  │  ├─ auth.middleware.js  # Socket authentication
│  │  ├─ rooms.js            # Room events
│  │  └─ private.js          # Private chat
│  │  └─ user.js
│  ├─ services/
│  │  ├─ message.service.js  # Database message logic
│  │  └─ user.service.js     # User/status logic
├─ frontend/
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package.json
│  ├─ README.md
│  ├─ vite.config.js
│  ├─ public/
│  ├─ src/
│  │  ├─ api.js            # Centralized API calls
│  │  ├─ App.css
│  │  ├─ App.jsx
│  │  ├─ index.css
│  │  ├─ main.jsx
│  │  ├─ assets/
│  │  ├─ components/
│  │  │  ├─ ChannelList.jsx
│  │  │  ├─ MessageInput.jsx
│  │  │  ├─ MessageList.jsx
│  │  │  ├─ PrivateChatModal.jsx
│  │  │  ├─ Sidebar.jsx
│  │  │  ├─ UsersList.jsx
│  │  ├─ pages/
│  │  │  ├─ Chat.jsx
│  │  │  ├─ Login.jsx
│  │  │  ├─ Register.jsx
```

Database Structure
Users Table
CREATE TABLE users (
id INT AUTO_INCREMENT PRIMARY KEY,
username VARCHAR(255) UNIQUE NOT NULL,
password VARCHAR(255) NOT NULL
);

Sessions Table
CREATE TABLE sessions (
id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT NOT NULL,
session_token VARCHAR(255) NOT NULL,
FOREIGN KEY (user_id) REFERENCES users(id)
);

Public Messages Table
CREATE TABLE public_messages (
id INT AUTO_INCREMENT PRIMARY KEY,
room VARCHAR(255) NOT NULL,
sender VARCHAR(255) NOT NULL,
message TEXT NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

Private Messages Table
CREATE TABLE private_messages (
id INT AUTO_INCREMENT PRIMARY KEY,
sender VARCHAR(255) NOT NULL,
receiver VARCHAR(255) NOT NULL,
message TEXT NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

Setup and Installation

Backend

1. Navigate to backend:

   ```
   cd backend
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Set up the database:

   - Create a MySQL database named `convohub`
   - Run the SQL script:
     ```
     mysql -u root -p convohub < mysql.sql
     ```

4. Create a `.env` file:

   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=yourpassword
   DB_NAME=convohub
   PORT=4000
   ```

5. Start the server:
   ```
   npm start
   ```

Frontend

1. Navigate to frontend:

   ```
   cd ../frontend
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the development server:

   ```
   npm run dev
   ```

4. Open your browser at `http://localhost:5173` (default Vite port) and start chatting.

Usage

Register/Login a user.

Join a public room and send messages.

Click on a user in the sidebar to open a private chat.

See online/offline status in real-time.

Refresh the page to see persisted chat history.

Future Improvements

- Add typing indicators for private and public chats.
- Implement read receipts for private messages.
- Allow users to create custom chat rooms.
- Implement file/image sharing in messages.
- Add dark/light mode toggle.
