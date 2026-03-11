# Environment & MongoDB Setup Guide

This guide walks you through setting up environment variables and MongoDB so **signup**, **login**, and the rest of the app work.

---

## 1. Backend environment (server)

### 1.1 Create the `.env` file

1. Open the **`server`** folder in your project.
2. Create a new file named **`.env`** (no filename before the dot).
3. Copy the contents below and paste into `server/.env`:

```env
PORT=5000
MONGO_URI=<see Section 2 below>
JWT_SECRET=<see Section 1.2 below>
```

**Do not commit `.env` to git.** It should already be in `.gitignore`.

### 1.2 Set `JWT_SECRET`

- Used to sign and verify login tokens. Must be a long, random string.
- **Local development:** you can use any long random string, e.g.  
  `JWT_SECRET=my-dev-secret-key-at-least-32-chars-long`
- **Production:** generate a strong secret, e.g.:
  - Windows PowerShell: `[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) | ForEach-Object { [byte]$_ })`
  - Or use a password generator and paste a 32+ character string.

Example for local dev:

```env
JWT_SECRET=my-dev-secret-key-at-least-32-chars-long
```

---

## 2. MongoDB setup

You can use **local MongoDB** or **MongoDB Atlas** (cloud). Pick one.

---

### Option A: Local MongoDB

Best for quick local development.

#### Install MongoDB

- **Windows:**  
  - Download the Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community).  
  - Run the installer and choose “Complete”. Optionally install as a service so it starts with Windows.
- **macOS:**  
  `brew tap mongodb/brew && brew install mongodb-community`  
  Then start: `brew services start mongodb-community`
- **Linux:**  
  Follow [Install MongoDB Community](https://www.mongodb.com/docs/manual/administration/install-on-linux/) for your distro.

#### Check it’s running

- Default port is **27017**.
- Windows: open Services and look for “MongoDB”, or run `mongod` from a terminal.
- macOS/Linux: `brew services list` or `sudo systemctl status mongod`.

#### Set `MONGO_URI` in `server/.env`

Use this in `server/.env`:

```env
MONGO_URI=mongodb://localhost:27017/dev-collab
```

- `localhost:27017` = your local MongoDB.
- `dev-collab` = database name (created automatically when the app first connects).

Your full `server/.env` for local MongoDB:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/dev-collab
JWT_SECRET=my-dev-secret-key-at-least-32-chars-long
```

---

### Option B: MongoDB Atlas (cloud)

Use this for production or if you don’t want to install MongoDB locally.

#### 2.1 Create an account and cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Sign up or log in.
3. Create a new **Organization** and **Project** (or use defaults).
4. Click **Build a Database**.
5. Choose **M0 FREE** (shared) and a region close to you.
6. Click **Create**.

#### 2.2 Create a database user

1. Under **Security → Database Access**, click **Add New Database User**.
2. Choose **Password** authentication.
3. Set a **Username** (e.g. `devcollab-user`) and a **Password** (save it somewhere safe).
4. Under “Database User Privileges”, choose **Read and write to any database** (or “Atlas admin” for dev).
5. Click **Add User**.

#### 2.3 Allow network access (IP whitelist)

1. Under **Security → Network Access**, click **Add IP Address**.
2. For **local development**, you can:
   - Click **Add Current IP Address**, or  
   - Use **Allow Access from Anywhere** (`0.0.0.0/0`) for simplicity (only for dev; avoid in production if possible).
3. Confirm with **Add IP Address**.

#### 2.4 Get the connection string

1. Go to **Database** in the left sidebar.
2. Click **Connect** on your cluster.
3. Choose **Connect your application**.
4. **Driver:** Node.js. Copy the connection string. It looks like:

```text
mongodb+srv://devcollab-user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

5. Replace **`<password>`** with the database user password you set (if the password has special characters, URL-encode them, e.g. `@` → `%40`).
6. Optionally add a database name before the `?` so the app uses a specific DB:

```text
mongodb+srv://devcollab-user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/dev-collab?retryWrites=true&w=majority
```

Here `dev-collab` is the database name.

#### 2.5 Set `MONGO_URI` in `server/.env`

Paste the final connection string (with real password and optional DB name) into `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://devcollab-user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/dev-collab?retryWrites=true&w=majority
JWT_SECRET=my-dev-secret-key-at-least-32-chars-long
```

---

## 3. Frontend environment (client)

So that the React app talks to your **local** backend and WebSocket server:

1. In the **`client`** folder, create a file named **`.env`**.
2. Put this in it:

```env
VITE_API_URL=http://localhost:5000
VITE_WS_URL=http://localhost:5000
```

- **VITE_API_URL** – used for signup, login, projects, tasks (REST).
- **VITE_WS_URL** – used for Socket.io (real-time updates). For local dev it’s the same as the API.

If your backend runs on another port, change `5000` to that port.

---

## 4. Checklist before testing signup

| Step | Where | What |
|------|--------|------|
| 1 | `server/.env` | File exists with `PORT`, `MONGO_URI`, `JWT_SECRET` |
| 2 | MongoDB | Local MongoDB is running, or Atlas cluster is set up and connection string is correct |
| 3 | `client/.env` | File exists with `VITE_API_URL=http://localhost:5000` and `VITE_WS_URL=http://localhost:5000` |
| 4 | Backend | Run `cd server && npm run dev` — you should see “MongoDB connected” and “Server running on port 5000” |
| 5 | Frontend | Run `cd client && npm run dev` — open http://localhost:5173 |

---

## 5. Test signup and login

1. Open **http://localhost:5173** in the browser.
2. You should be redirected to the **Login** page if not logged in.
3. Click **Sign up** (or go to `/signup`).
4. Enter:
   - Name  
   - Email  
   - Password (at least 6 characters)
5. Click **Sign up**.

If everything is set up correctly:

- You are logged in and redirected to the **Dashboard**.
- In MongoDB (Compass or Atlas UI), you should see a **users** collection in the `dev-collab` database with your new user (password will be hashed).

Then try **Log out** and **Sign in** with the same email and password to confirm login works.

---

## 6. Common issues

### “MongoDB connection error” or “MongoServerSelectionError”

- **Local:** Ensure MongoDB is running (`mongod` or Windows Service).
- **Atlas:** Check that your IP is whitelisted and the connection string has the correct password (and URL-encoded special characters).

### “Authentication required” or 401 on API calls

- Backend is running and `JWT_SECRET` in `server/.env` is set.
- You signed up or logged in successfully so the frontend has a token in `localStorage`.

### Frontend can’t reach the API (network error, CORS)

- Backend is running on the port in `server/.env` (default 5000).
- `client/.env` has `VITE_API_URL=http://localhost:5000` (same host and port).
- Restart the **client** dev server after changing `.env` (Vite reads env at startup).

### Changes to `.env` not applied

- Restart both **server** and **client** after editing `.env`.

---

## 7. Summary: minimal `.env` files

**`server/.env` (local + local MongoDB):**

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/dev-collab
JWT_SECRET=my-dev-secret-key-at-least-32-chars-long
```

**`server/.env` (local + Atlas):**

```env
PORT=5000
MONGO_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/dev-collab?retryWrites=true&w=majority
JWT_SECRET=my-dev-secret-key-at-least-32-chars-long
```

**`client/.env`:**

```env
VITE_API_URL=http://localhost:5000
VITE_WS_URL=http://localhost:5000
```

Once these are set and MongoDB is reachable, signup and login will work.
