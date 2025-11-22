# Supabase Manual Setup Guide

This document outlines the manual setup steps required in the Supabase Admin Dashboard that cannot be automated via MCP (Model Context Protocol) tools.

---

## 🚨 Required Manual Steps

### 1. Create Supabase Project

**Action Required:** Create a new Supabase project via the [Supabase Dashboard](https://app.supabase.com)

**Steps:**
1. Log in to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Select your organization
4. Enter project details:
   - **Name:** `prep-genie` (or your preferred name)
   - **Database Password:** Generate a strong password (save this securely!)
   - **Region:** Choose closest to your users (e.g., `us-west-1`, `eu-west-1`)
   - **Pricing Plan:** Free tier is sufficient for development
5. Click "Create new project"
6. Wait 2-3 minutes for project initialization

**Why Manual:** Project creation requires authentication and organization selection that cannot be automated via MCP.

---

### 2. Get API Keys and Project URL

**Action Required:** Copy your project's API credentials

**Steps:**
1. Navigate to **Settings** → **API** in your Supabase dashboard
2. Copy the following values to your `.env.local` file:

```bash
# Project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Anon/Public Key (safe for client-side use)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service Role Key (NEVER expose to client - server-side only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ Security Warning:**
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Safe for client-side, respects RLS policies
- `SUPABASE_SERVICE_ROLE_KEY` - **NEVER** expose to client, bypasses RLS, server-only

**Why Manual:** API keys are sensitive credentials that must be manually copied to environment variables.

---

### 3. Run Database Migrations

**Action Required:** Apply the database schema to your Supabase project

**Option A: Using Supabase CLI (Recommended)**

```bash
# Link your local project to Supabase project
supabase link --project-ref your-project-id

# Apply all migrations
pnpm supabase:reset

# Generate TypeScript types
pnpm supabase:types
```

**Option B: Using Supabase Dashboard**

1. Navigate to **SQL Editor** in your Supabase dashboard
2. Open `supabase/migrations/20250101000000_initial_schema.sql`
3. Copy the entire SQL content
4. Paste into the SQL Editor
5. Click "Run"

**Why Manual:** While migrations can be applied via CLI, the initial project linking and credential configuration requires manual setup.

---

### 4. Configure Authentication Providers

**Action Required:** Enable authentication methods in Supabase

**Email Authentication (Default - Required):**
1. Navigate to **Authentication** → **Providers**
2. **Email** should be enabled by default
3. Configure email settings:
   - **Enable Email Confirmations:** Recommended for production
   - **Secure Email Change:** Recommended
   - **Double Confirm Email Changes:** Recommended for production

**Optional - OAuth Providers:**

If you want to add Google/GitHub login:

**Google OAuth:**
1. Navigate to **Authentication** → **Providers**
2. Enable **Google**
3. Enter your Google OAuth credentials:
   - **Client ID:** From [Google Cloud Console](https://console.cloud.google.com)
   - **Client Secret:** From Google Cloud Console
4. Add authorized redirect URL: `https://your-project-id.supabase.co/auth/v1/callback`

**GitHub OAuth:**
1. Navigate to **Authentication** → **Providers**
2. Enable **GitHub**
3. Enter your GitHub OAuth credentials:
   - **Client ID:** From [GitHub Developer Settings](https://github.com/settings/developers)
   - **Client Secret:** From GitHub Developer Settings
4. Add callback URL: `https://your-project-id.supabase.co/auth/v1/callback`

**Why Manual:** OAuth provider configuration requires external credentials and dashboard setup.

---

### 5. Configure Email Templates (Optional but Recommended)

**Action Required:** Customize authentication emails

**Steps:**
1. Navigate to **Authentication** → **Email Templates**
2. Customize the following templates:
   - **Confirm signup** - Welcome email with confirmation link
   - **Invite user** - Team invitation email
   - **Magic Link** - Passwordless login email
   - **Change Email Address** - Email change confirmation
   - **Reset Password** - Password reset email

**Default Template Variables:**
- `{{ .ConfirmationURL }}` - Confirmation/action link
- `{{ .Token }}` - OTP code
- `{{ .SiteURL }}` - Your application URL
- `{{ .Email }}` - User's email address

**Why Manual:** Email template customization is project-specific and requires dashboard access.

---

### 6. Configure Site URL and Redirect URLs

**Action Required:** Set your application's URLs for auth redirects

**Steps:**
1. Navigate to **Authentication** → **URL Configuration**
2. Set **Site URL:**
   - **Development:** `http://localhost:3000`
   - **Production:** `https://your-domain.com`
3. Add **Redirect URLs** (comma-separated):
   ```
   http://localhost:3000/**,https://your-domain.com/**
   ```

**Why Manual:** Site URLs are environment-specific and must match your deployment configuration.

---

### 7. Enable Row Level Security (RLS) - Verification

**Action Required:** Verify RLS is enabled (should be automatic from migration)

**Steps:**
1. Navigate to **Database** → **Tables**
2. Verify each table has RLS enabled (green checkmark):
   - `user_profiles`
   - `meals`
   - `meal_plans`
   - `meal_plan_items`
   - `grocery_lists`
   - `saved_meals`
   - `progress_logs`
   - `ai_chat_history`

**If RLS is not enabled:**
1. Click on the table
2. Click "Enable RLS"

**Why Manual:** While migrations enable RLS automatically, verification via dashboard is recommended for security.

---

### 8. Set Up Storage Buckets (Optional - For Meal Images)

**Action Required:** Create storage buckets for user-uploaded images

**Steps:**
1. Navigate to **Storage**
2. Click "Create a new bucket"
3. Create bucket with:
   - **Name:** `meal-images`
   - **Public:** Yes (for publicly accessible meal images)
   - **File size limit:** 5 MB (recommended)
   - **Allowed MIME types:** `image/png, image/jpeg, image/jpg, image/webp`

**Set Storage Policies:**
```sql
-- Allow authenticated users to upload
CREATE POLICY "Users can upload meal images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'meal-images');

-- Allow anyone to view public meal images
CREATE POLICY "Public meal images are viewable"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'meal-images');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own meal images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'meal-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

**Why Manual:** Storage bucket creation and policy configuration requires dashboard access.

---

## ✅ What Can Be Automated (No Manual Steps)

The following operations can be handled automatically via the Supabase MCP tools:

- ✅ **List projects** - `mcp__supabase__list_projects`
- ✅ **Get project details** - `mcp__supabase__get_project`
- ✅ **Execute SQL queries** - `mcp__supabase__execute_sql`
- ✅ **Apply migrations** - `mcp__supabase__apply_migration`
- ✅ **List tables** - `mcp__supabase__list_tables`
- ✅ **Generate TypeScript types** - `mcp__supabase__generate_typescript_types`
- ✅ **Get project URL** - `mcp__supabase__get_project_url`
- ✅ **Get API keys** - `mcp__supabase__get_publishable_keys`

---

## 🔄 Post-Setup Workflow

After completing manual setup:

1. **Verify environment variables** are set in `.env.local`
2. **Link local project** to Supabase:
   ```bash
   supabase link --project-ref your-project-id
   ```
3. **Generate TypeScript types**:
   ```bash
   pnpm supabase:types
   ```
4. **Test authentication**:
   ```bash
   pnpm dev
   # Visit http://localhost:3000/register
   # Create a test account
   # Verify email confirmation (if enabled)
   ```
5. **Verify RLS policies** by testing CRUD operations as authenticated user

---

## 🆘 Troubleshooting

### Issue: "Invalid API key" error

**Solution:**
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
- Restart dev server: `pnpm dev`

### Issue: "Row Level Security policy violation"

**Solution:**
- Verify RLS policies are applied (check migrations)
- Ensure user is authenticated before accessing protected tables
- Check that `auth.uid()` matches the `user_id` in the table

### Issue: "Email not sent" during registration

**Solution:**
- Check **Authentication** → **Email Templates** in dashboard
- Verify SMTP settings (Supabase provides default SMTP for development)
- For production, configure custom SMTP provider

### Issue: "Redirect URL mismatch" after OAuth login

**Solution:**
- Add your application URL to **Authentication** → **URL Configuration** → **Redirect URLs**
- Ensure URL matches exactly (including protocol and trailing slashes)

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Auth Helpers for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Storage Guide](https://supabase.com/docs/guides/storage)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)

---

**Last Updated:** 2025-01-22
**PrepGenie Version:** 1.0.0
**Supabase Version:** 2.58.0+
