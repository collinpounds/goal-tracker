# Supabase Authentication Implementation

## Overview

This document provides instructions for setting up and testing the newly implemented Supabase Authentication with JWT token verification and role-based access control (RBAC).

---

## ✅ What Has Been Implemented

### Backend Changes

1. **JWT Token Verification** ([backend/app/auth.py](backend/app/auth.py))
   - JWT verification using Supabase JWT secret
   - `get_current_user()` FastAPI dependency
   - `get_current_user_id()` helper dependency
   - `require_role()` for role-based access control

2. **Protected API Endpoints** ([backend/app/routers/goals.py](backend/app/routers/goals.py))
   - All goal endpoints now require authentication
   - Goals are automatically scoped to the logged-in user
   - User cannot access other users' goals

3. **Updated Goal Model** ([backend/app/models/goal.py](backend/app/models/goal.py))
   - Added `user_id` field to Goal schema
   - All CRUD methods filter by `user_id`
   - Ownership verification on update/delete operations

4. **Configuration** ([backend/app/config.py](backend/app/config.py))
   - Added `SUPABASE_JWT_SECRET` setting
   - Added `SUPABASE_SERVICE_ROLE_KEY` for admin operations

5. **Dependencies**
   - Added `PyJWT==2.8.0` for JWT verification

### Frontend Changes

1. **Supabase Client** ([frontend/src/lib/supabase.js](frontend/src/lib/supabase.js))
   - Initialized Supabase client with URL and anon key
   - Configured for localStorage session persistence

2. **Auth Redux Slice** ([frontend/src/models/authSlice.js](frontend/src/models/authSlice.js))
   - State: `user`, `session`, `loading`, `error`, `initialized`
   - Async thunks: `login`, `signup`, `logout`, `checkSession`
   - Selectors for easy state access

3. **Authentication UI**
   - **Login Page** ([frontend/src/views/LoginView.jsx](frontend/src/views/LoginView.jsx))
   - **Signup Page** ([frontend/src/views/SignupView.jsx](frontend/src/views/SignupView.jsx))
   - **Protected Routes** ([frontend/src/components/ProtectedRoute.jsx](frontend/src/components/ProtectedRoute.jsx))

4. **API Token Injection** ([frontend/src/api/goals.js](frontend/src/api/goals.js))
   - Request interceptor adds JWT token to all API calls
   - Response interceptor handles 401 errors (redirects to login)

5. **Session Management** ([frontend/src/App.jsx](frontend/src/App.jsx))
   - Checks for existing session on app load
   - Listens for auth state changes (login, logout, token refresh)

6. **User Interface**
   - Logout button in Goals view
   - Display logged-in user's email
   - Protected routes redirect to login if not authenticated

---

## 🚀 Setup Instructions

### Step 1: Run the Database Migration

1. Open your **Supabase Dashboard** at https://supabase.com/dashboard
2. Navigate to your project: `bnmdrvslwmuimlpkqqfq`
3. Go to **SQL Editor**
4. Open the file [database_migration.sql](database_migration.sql)
5. Copy the entire SQL script
6. Paste it into the SQL Editor
7. Click **Run** to execute the migration

This will:
- Add `user_id` column to the `goals` table
- Create indexes for performance
- Set up Row Level Security (RLS) policies
- Enable user-scoped access to goals

### Step 2: Verify Environment Variables

The environment variables have been updated in [.env.production](.env.production):

```bash
# Backend variables
SUPABASE_JWT_SECRET=xLsctlfyirDKxMGpDdca05n1IK2cxqcn0ceeA6hE0HrrNBMRty7Ad8JsjDnE6L/GFBJytOhmxmT32qT8mD+A8g==
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...fhp8

# Frontend variables (VITE_ prefix)
VITE_SUPABASE_URL=https://bnmdrvslwmuimlpkqqfq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...jKg
```

**Important:** Make sure these environment variables are available to:
- Backend container (for JWT verification)
- Frontend build process (for Supabase client)

### Step 3: Install Dependencies

```bash
# Backend dependencies
cd backend
pip install -r requirements.txt

# Frontend dependencies
cd ../frontend
npm install
```

### Step 4: Rebuild and Start the Application

```bash
# From the root directory
docker-compose down
docker-compose up --build
```

---

## 🧪 Testing Instructions

### Test 1: User Signup

1. Navigate to http://localhost
2. You should be redirected to `/login`
3. Click **"Sign up here"** link
4. Fill in the signup form:
   - Email: `test@example.com`
   - Password: `password123`
   - Confirm Password: `password123`
5. Click **"Create Account"**
6. **Expected Result:**
   - If email confirmation is enabled: You'll see a "Check your email" message
   - If email confirmation is disabled: You'll be logged in and redirected to goals page

### Test 2: User Login

1. Navigate to http://localhost/login
2. Enter your credentials:
   - Email: `test@example.com`
   - Password: `password123`
3. Click **"Sign in"**
4. **Expected Result:**
   - You should be redirected to the goals page
   - You should see your email displayed in the top-right corner
   - You should see a "Logout" button

### Test 3: Session Persistence

1. While logged in, refresh the page (F5 or Cmd+R)
2. **Expected Result:**
   - You should remain logged in
   - Goals page should load without redirecting to login

### Test 4: Create a Goal

1. While logged in, click **"+ Create New Goal"**
2. Fill in the form:
   - Title: `Test Goal`
   - Description: `This is a test goal`
   - Status: `pending`
3. Click **"Create Goal"** or **"Save Goal"**
4. **Expected Result:**
   - Goal should be created successfully
   - Goal should appear in your goals list

### Test 5: User-Scoped Goals

1. Open the browser DevTools (F12)
2. Go to **Application** > **Local Storage**
3. Find the Supabase auth token
4. Create a new user in Supabase Dashboard or sign up with a different email
5. Log in with the new user
6. **Expected Result:**
   - The new user should NOT see the first user's goals
   - Goals list should be empty for the new user

### Test 6: Protected Routes

1. While NOT logged in, try to access http://localhost/goals directly
2. **Expected Result:**
   - You should be redirected to `/login`
   - After logging in, you'll be taken to the goals page

### Test 7: Logout

1. While logged in, click the **"Logout"** button in the top-right corner
2. **Expected Result:**
   - You should be redirected to `/login`
   - Trying to access `/goals` should redirect you to `/login`
   - Session should be cleared from localStorage

### Test 8: Token Expiration (Optional)

1. Log in to the application
2. Wait for the token to expire (default: 1 hour)
   - OR manually modify the token in localStorage to make it invalid
3. Try to perform any action (create/update/delete goal)
4. **Expected Result:**
   - API should return 401 Unauthorized
   - You should be automatically logged out and redirected to `/login`

---

## 🔐 Security Notes

### Environment Variables

- **NEVER commit actual `.env` files** to version control
- The `.env.example` file is for reference only
- JWT Secret and Service Role Key must be kept secret

### API Keys

- **SUPABASE_ANON_KEY**: Safe for client-side use (protected by RLS)
- **SUPABASE_SERVICE_ROLE_KEY**: NEVER expose on client-side (bypasses RLS)
- **SUPABASE_JWT_SECRET**: Only used server-side for token verification

### Row Level Security (RLS)

- RLS policies ensure users can only access their own data
- Backend also verifies ownership as an additional security layer
- Admin role can override RLS (if admin policies are enabled)

---

## 🛠️ Troubleshooting

### Issue: "Missing VITE_SUPABASE_URL environment variable"

**Solution:** Make sure the frontend has access to environment variables:
```bash
# Check if variables are in .env.production
grep VITE_ .env.production

# Rebuild frontend
cd frontend && npm run build
```

### Issue: "Token verification failed"

**Solution:** Ensure the JWT secret matches your Supabase project:
1. Go to Supabase Dashboard → Settings → API → JWT Settings
2. Copy the JWT Secret
3. Update `SUPABASE_JWT_SECRET` in `.env.production`
4. Restart the backend

### Issue: "Goals not loading after login"

**Solution:** Check the browser console for errors:
- Open DevTools (F12) → Console
- Look for network errors (401, 403, 500)
- Verify the token is being sent in the `Authorization` header

### Issue: "Cannot access database table"

**Solution:** Run the database migration:
1. The `goals` table needs a `user_id` column
2. Execute the SQL in [database_migration.sql](database_migration.sql)
3. Restart the application

### Issue: "User can see other users' goals"

**Solution:** Check RLS policies:
1. Go to Supabase Dashboard → Authentication → Policies
2. Verify policies are enabled for the `goals` table
3. Re-run the migration SQL if policies are missing

---

## 📊 Database Schema

After running the migration, the `goals` table schema should look like this:

```sql
goals (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  target_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)
```

### Indexes

- `idx_goals_user_id` on `user_id` column (for faster queries)

### RLS Policies

- **SELECT**: Users can view only their own goals
- **INSERT**: Users can create goals with their own `user_id`
- **UPDATE**: Users can update only their own goals
- **DELETE**: Users can delete only their own goals

---

## 🎯 Next Steps (Optional Enhancements)

1. **Email Verification**
   - Enable email confirmation in Supabase Dashboard
   - Add email verification UI flow

2. **Password Reset**
   - Implement "Forgot Password" link
   - Add password reset flow

3. **Admin Role**
   - Uncomment admin policies in the migration
   - Add admin dashboard to view all goals

4. **Profile Management**
   - Create user profile page
   - Allow users to update email/password

5. **OAuth Providers**
   - Enable Google, GitHub, or other OAuth providers
   - Add social login buttons to Login view

---

## 📝 Architecture Overview

### Authentication Flow

```
1. User visits app → App checks for session
2. No session → Redirect to /login
3. User enters credentials → Supabase Auth validates
4. Supabase returns JWT token → Store in localStorage
5. Token added to all API requests → Backend verifies JWT
6. Backend extracts user_id → Filter goals by user_id
7. Return user-scoped data → Display in UI
```

### JWT Token Structure

```json
{
  "sub": "user-uuid-here",
  "email": "user@example.com",
  "aud": "authenticated",
  "role": "authenticated",
  "iat": 1234567890,
  "exp": 1234567890
}
```

---

## 🔗 Useful Links

- [Supabase Authentication Docs](https://supabase.com/docs/guides/auth)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [Redux Toolkit Async Thunks](https://redux-toolkit.js.org/api/createAsyncThunk)
- [React Router Protected Routes](https://reactrouter.com/en/main/start/tutorial#protected-routes)

---

## ✅ Checklist

Use this checklist to verify the implementation is complete:

- [ ] Database migration executed successfully
- [ ] Environment variables configured in `.env.production`
- [ ] Backend dependencies installed (`PyJWT`)
- [ ] Frontend dependencies installed (`@supabase/supabase-js`)
- [ ] Docker containers rebuilt and running
- [ ] User can sign up with email/password
- [ ] User can log in with credentials
- [ ] User is redirected to goals page after login
- [ ] Session persists after page refresh
- [ ] User can create goals (goals have `user_id`)
- [ ] User can only see their own goals
- [ ] Protected routes redirect to login
- [ ] Logout button works correctly
- [ ] API returns 401 for invalid/expired tokens

---

**Congratulations!** 🎉 You've successfully implemented Supabase Authentication with JWT and RBAC!

If you encounter any issues, refer to the Troubleshooting section above or check the implementation files listed in this document.
