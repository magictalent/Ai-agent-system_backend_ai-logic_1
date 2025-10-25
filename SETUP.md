# Supabase Authentication Setup

## Environment Variables Required

### Backend (.env file in backend/ directory)
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
```

### Frontend (.env.local file in frontend/ directory)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## How to Get These Values

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the following values:
   - **Project URL** → Use for both `SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → Use for both `SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → Use for `SUPABASE_SERVICE_ROLE_KEY` (backend only)

## Important Notes

- **Frontend** uses the `anon` key (safe for client-side)
- **Backend** uses the `service_role` key (admin privileges)
- Never expose the `service_role` key in frontend code
- The `anon` key is safe to use in frontend applications

## File Structure
```
backend/
  .env                    # Backend environment variables
frontend/
  .env.local             # Frontend environment variables
```

## Troubleshooting

If you get "No API key found" error:
1. Check that your `.env.local` file exists in the frontend directory
2. Verify the environment variable names are correct
3. Restart your development servers after adding environment variables
4. Make sure the Supabase project is active and not paused
