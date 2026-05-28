# Database Setup Guide - Archidiary

## Overview
Your app is now connected to **Supabase**, a PostgreSQL-based backend-as-a-service platform. This guide walks you through completing the setup.

## ✅ What's Been Done

1. ✅ Installed `@supabase/supabase-js` package
2. ✅ Updated environment variables in `.env.local`
3. ✅ Created Supabase client (`src/lib/supabase.ts`)
4. ✅ Created database utility functions (`src/lib/database.ts`)
5. ✅ Updated authentication components (Login, Register, ForgotPassword)
6. ✅ Updated Dashboard and UploadProject components to use real database

## 🔧 Complete Setup Steps

### Step 1: Create Database Tables in Supabase

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign in with your account
3. Select your project: **archidiary**
4. Navigate to **SQL Editor** (left sidebar)
5. Create a new query and copy-paste the SQL from `DATABASE_SETUP.sql`:
   ```sql
   -- Create Users Table
   CREATE TABLE users (
     id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
     email VARCHAR(255) NOT NULL UNIQUE,
     full_name VARCHAR(255),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
   -- Create Projects Table
   CREATE TABLE projects (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     title VARCHAR(255) NOT NULL,
     category VARCHAR(100),
     description TEXT,
     link VARCHAR(500),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
   -- Create Indexes
   CREATE INDEX idx_projects_user_id ON projects(user_id);
   CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
   
   -- Enable Row Level Security
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
   
   -- RLS Policies
   CREATE POLICY "Users can view their own profile"
     ON users FOR SELECT USING (auth.uid() = id);
   
   CREATE POLICY "Users can update their own profile"
     ON users FOR UPDATE USING (auth.uid() = id);
   
   CREATE POLICY "Users can view their own projects"
     ON projects FOR SELECT USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can insert their own projects"
     ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
   
   CREATE POLICY "Users can update their own projects"
     ON projects FOR UPDATE USING (auth.uid() = user_id);
   
   CREATE POLICY "Users can delete their own projects"
     ON projects FOR DELETE USING (auth.uid() = user_id);
   ```

6. Click **Run** to execute the SQL

### Step 2: Enable Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Ensure **Email** provider is enabled (it should be by default)
3. Go to **Email Templates** and customize if needed

### Step 3: Test the Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:5173

3. Test the following flows:
   - ✅ **Register**: Create a new account
   - ✅ **Login**: Sign in with your credentials
   - ✅ **Upload Project**: Add a project from the dashboard
   - ✅ **View Projects**: See uploaded projects in the dashboard
   - ✅ **Delete Project**: Remove a project
   - ✅ **Logout**: Sign out

## 📋 Feature Details

### Authentication
- **Sign Up**: Creates user account and stores profile in `users` table
- **Sign In**: Authenticates with Supabase Auth
- **Forgot Password**: Sends password reset email
- **Session Management**: Handled by Supabase Auth

### Projects Management
- **Add Project**: Saves to database with user association
- **View Projects**: Fetches user's projects from database
- **Delete Project**: Removes project from database
- **Security**: Row-Level Security (RLS) ensures users only see their own data

## 🔑 Environment Variables

Your `.env.local` now contains:
```
VITE_SUPABASE_URL=https://qyndmlqrrtafrdiyhxoy.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_1FM4C1Ghv9bssFly8n7L4Q_O-Qscr8D
```

**Important**: These are your public keys for client-side operations. Never expose your service role key in client-side code.

## 📁 File Structure

```
src/
├── lib/
│   ├── supabase.ts          # Supabase client initialization
│   └── database.ts          # All database functions
├── components/
│   ├── Login.tsx            # Login with Supabase auth
│   ├── Register.tsx         # Sign up with Supabase auth
│   ├── ForgotPassword.tsx   # Password reset
│   ├── Dashboard.tsx        # Fetch and display projects
│   └── UploadProject.tsx    # Add projects to database
└── App.tsx                  # Main app component
```

## 🚨 Common Issues

### "Missing Supabase environment variables"
- Ensure `.env.local` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart your dev server after adding env variables

### "Permission denied" errors
- Check that RLS policies are correctly set up
- Verify user is authenticated before making database requests

### Tables not found
- Make sure you ran the SQL setup script in Supabase SQL Editor
- Check that all tables are created in the `public` schema

## 🎯 Next Steps

1. **Customize User Profile**: Add more fields to the `users` table (phone, avatar, etc.)
2. **Add Validation**: Implement form validation for better UX
3. **Error Handling**: Add global error notification system
4. **File Storage**: Use Supabase Storage for project images/documents
5. **Real-time Updates**: Use Supabase Realtime for live project updates
6. **Deployment**: Deploy to production (Vercel, Netlify, etc.)

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Authentication](https://supabase.com/docs/guides/auth)

---

Your app is now ready to use with a real database! 🎉
