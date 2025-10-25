# Environment Setup Guide

## 🚀 **Step 1: Create Backend .env File**

Create a file called `.env` in the `backend/` directory with these contents:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Other environment variables
NODE_ENV=development
PORT=3001
```

## 🔑 **Step 2: Get Your Supabase Keys**

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy these values:
   - **Project URL** → Use as `SUPABASE_URL`
   - **anon public** key → Use as `SUPABASE_ANON_KEY`
   - **service_role** key → Use as `SUPABASE_SERVICE_ROLE_KEY`

## 📝 **Step 3: Update Your .env File**

Replace the placeholder values in your `.env` file with the actual values from Supabase.

## 🗄️ **Step 4: Create Messages Table**

Run this SQL script in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of create-messages-table-simple-fixed.sql
```

## 🚀 **Step 5: Start the Backend**

```bash
cd backend
npm run start:dev
```

## ✅ **Step 6: Test the Messages Page**

1. Start your frontend: `npm run dev` (in the root directory)
2. Go to `/messages` in your browser
3. You should see the messages dashboard

## 🔧 **Troubleshooting**

### If you get "Missing script: start:dev" error:
```bash
cd backend
npm install
npm run start:dev
```

### If you get environment variable errors:
- Make sure your `.env` file is in the `backend/` directory
- Check that the file is named exactly `.env` (not `.env.local` or `.env.example`)
- Restart the backend server after creating the `.env` file

### If you get SQL errors:
- Make sure you run the SQL script in the Supabase dashboard
- Check that the `campaigns` table exists first
- The script will create sample data automatically
