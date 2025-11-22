# Supabase Setup Guide - PrepGenie

This document outlines what has been set up via MCP and what requires manual configuration in the Supabase Admin Dashboard.

---

## ✅ Already Configured via MCP

The following has been automatically set up using Supabase MCP tools:

### Project Details
- **Project Name:** PrepGenie
- **Project ID:** `nwuzxcpljlvwhpitwutf`
- **Region:** `ap-northeast-1` (Tokyo)
- **Status:** ACTIVE_HEALTHY
- **Database Version:** PostgreSQL 17.6.1
- **Project URL:** `https://nwuzxcpljlvwhpitwutf.supabase.co`

### Database Schema
✅ **All tables created with RLS enabled:**
- `user_profiles` - User profile and nutrition data
- `meals` - Meal/recipe database
- `meal_plans` - Weekly/daily meal plans
- `meal_plan_items` - Individual meal plan entries
- `grocery_lists` - Shopping lists
- `saved_meals` - User's favorite meals
- `progress_logs` - Weight/nutrition tracking
- `ai_chat_history` - AI conversation logs

✅ **Migration Applied:**
- `20251122041652_initial_schema` - Complete database schema with RLS policies

### API Credentials (Already in .env.local)
✅ **Project URL:** `https://nwuzxcpljlvwhpitwutf.supabase.co`
✅ **Anon Key:** Already configured in `.env.local`

---

## ⚠️ Required Manual Setup

### 1. Get Service Role Key

**Action Required:** Copy the service role key from Supabase Dashboard

**Why Manual:** The service role key is highly sensitive and bypasses RLS policies. It cannot be retrieved via MCP for security reasons.

**Steps:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/nwuzxcpljlvwhpitwutf)
2. Navigate to **Settings** → **API**
3. Copy the **service_role** secret key
4. Update `.env.local`:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

**Current Status:** ❌ Not configured (shows `your_service_role_key_here` in `.env.local`)

---

### 2. Configure Authentication Settings

**Action Required:** Enable and configure auth providers in Supabase Dashboard

**Email Authentication (Required):**
1. Navigate to **Authentication** → **Providers** in [Supabase Dashboard](https://supabase.com/dashboard/project/nwuzxcpljlvwhpitwutf/auth/providers)
2. **Email** should be enabled by default
3. Configure email settings under **Authentication** → **Email Templates**:
   - ✅ **Enable Email Confirmations:** Recommended for production
   - ✅ **Secure Email Change:** Recommended
   - ✅ **Double Confirm Email Changes:** Recommended for production

**Email Templates to Customize:**
- **Confirm signup** - Welcome email with confirmation link
- **Magic Link** - Passwordless login email
- **Change Email Address** - Email change confirmation
- **Reset Password** - Password reset email

**Template Variables Available:**
- `{{ .ConfirmationURL }}` - Confirmation/action link
- `{{ .Token }}` - OTP code
- `{{ .SiteURL }}` - Your application URL (http://localhost:3000)
- `{{ .Email }}` - User's email address

**Why Manual:** Email template customization and provider configuration requires dashboard access.

---

### 3. Set Site URL and Redirect URLs

**Action Required:** Configure allowed redirect URLs for authentication

**Steps:**
1. Navigate to **Authentication** → **URL Configuration** in [Supabase Dashboard](https://supabase.com/dashboard/project/nwuzxcpljlvwhpitwutf/auth/url-configuration)
2. Set **Site URL:**
   - **Development:** `http://localhost:3000`
   - **Production:** `https://your-domain.com` (when deploying)
3. Add **Redirect URLs** (comma-separated):
   ```
   http://localhost:3000/**,https://your-domain.com/**
   ```

**Why Manual:** Site URLs are environment-specific and must match your deployment configuration.

---

### 4. Optional - OAuth Providers

If you want to add social login (Google/GitHub):

**Google OAuth:**
1. Create OAuth credentials at [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **Authentication** → **Providers** in Supabase
3. Enable **Google** and enter:
   - **Client ID:** From Google Cloud Console
   - **Client Secret:** From Google Cloud Console
4. Add authorized redirect URL: `https://nwuzxcpljlvwhpitwutf.supabase.co/auth/v1/callback`

**GitHub OAuth:**
1. Create OAuth app at [GitHub Developer Settings](https://github.com/settings/developers)
2. Navigate to **Authentication** → **Providers** in Supabase
3. Enable **GitHub** and enter:
   - **Client ID:** From GitHub
   - **Client Secret:** From GitHub
4. Add callback URL: `https://nwuzxcpljlvwhpitwutf.supabase.co/auth/v1/callback`

**Why Manual:** OAuth requires external provider credentials and dashboard configuration.

---

### 5. Optional - Storage Buckets (For Meal Images)

**Action Required:** Create storage bucket for user-uploaded meal images

**Steps:**
1. Navigate to **Storage** in [Supabase Dashboard](https://supabase.com/dashboard/project/nwuzxcpljlvwhpitwutf/storage/buckets)
2. Click "Create a new bucket"
3. Configure:
   - **Name:** `meal-images`
   - **Public:** Yes (for publicly accessible meal images)
   - **File size limit:** 5 MB (recommended)
   - **Allowed MIME types:** `image/png, image/jpeg, image/jpg, image/webp`

**Storage Policies (apply via SQL Editor):**
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

**Why Manual:** Storage bucket creation requires dashboard access, but policies can be applied via MCP using `execute_sql`.

---

## 🔧 Verification Checklist

After completing manual setup, verify:

- [ ] Service role key is set in `.env.local`
- [ ] Email authentication is enabled
- [ ] Site URL is set to `http://localhost:3000`
- [ ] Redirect URLs include `http://localhost:3000/**`
- [ ] Email templates are configured (optional but recommended)
- [ ] OAuth providers are set up (if using social login)
- [ ] Storage bucket created (if using meal image uploads)

---

## 🧪 Testing Authentication

After setup, test the authentication flow:

```bash
# Start the development server
pnpm dev

# Visit http://localhost:3000/register
# 1. Create a test account
# 2. Check email for confirmation (if enabled)
# 3. Verify login works
# 4. Check that protected routes redirect to /login when not authenticated
```

**Test protected routes:**
- Navigate to `http://localhost:3000/dashboard` (should redirect to `/login` if not authenticated)
- After login, should access dashboard without redirect

---

## 🛠️ What Can Be Done via MCP

The following operations are automated via Supabase MCP tools (already done or available):

- ✅ **Project Creation** - `mcp__supabase__create_project` (already done)
- ✅ **List Projects** - `mcp__supabase__list_projects`
- ✅ **Get Project Details** - `mcp__supabase__get_project`
- ✅ **Get Project URL** - `mcp__supabase__get_project_url`
- ✅ **Get API Keys** - `mcp__supabase__get_publishable_keys` (anon key only)
- ✅ **List Tables** - `mcp__supabase__list_tables`
- ✅ **List Migrations** - `mcp__supabase__list_migrations`
- ✅ **Apply Migrations** - `mcp__supabase__apply_migration` (already done)
- ✅ **Execute SQL** - `mcp__supabase__execute_sql`
- ✅ **Generate TypeScript Types** - `mcp__supabase__generate_typescript_types`

---

## 🆘 Troubleshooting

### Issue: "Invalid API key" error

**Solution:**
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
- Restart dev server: `pnpm dev`

### Issue: Service Role Key not working

**Solution:**
- Ensure you copied the **service_role** key, not the **anon** key
- Check that key is set in `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`
- Service role key bypasses RLS - use only in Server Actions/API routes, never client-side

### Issue: "Row Level Security policy violation"

**Solution:**
- Verify user is authenticated before accessing protected tables
- Check that `auth.uid()` matches the `user_id` in the table
- RLS policies are already applied via migration

### Issue: "Email not sent" during registration

**Solution:**
- Check **Authentication** → **Email Templates** in dashboard
- Supabase provides default SMTP for development (rate-limited)
- For production, configure custom SMTP provider

### Issue: "Redirect URL mismatch" after login

**Solution:**
- Add your application URL to **Authentication** → **URL Configuration** → **Redirect URLs**
- Ensure URL matches exactly (including protocol)
- Default should include `http://localhost:3000/**`

---

## 📊 Current Status Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Supabase Project | ✅ Created | Project ID: nwuzxcpljlvwhpitwutf |
| Database Schema | ✅ Deployed | All 8 tables with RLS enabled |
| Project URL | ✅ Configured | In .env.local |
| Anon Key | ✅ Configured | In .env.local |
| Service Role Key | ⚠️ Manual Required | Copy from dashboard |
| Email Auth | ⚠️ Manual Required | Enable in dashboard |
| Site URL | ⚠️ Manual Required | Set in dashboard |
| Redirect URLs | ⚠️ Manual Required | Set in dashboard |
| OAuth Providers | ⏸️ Optional | Configure if needed |
| Storage Buckets | ⏸️ Optional | Create if using images |

---

## 📚 Quick Links

- **Supabase Project Dashboard:** https://supabase.com/dashboard/project/nwuzxcpljlvwhpitwutf
- **API Settings:** https://supabase.com/dashboard/project/nwuzxcpljlvwhpitwutf/settings/api
- **Auth Providers:** https://supabase.com/dashboard/project/nwuzxcpljlvwhpitwutf/auth/providers
- **URL Configuration:** https://supabase.com/dashboard/project/nwuzxcpljlvwhpitwutf/auth/url-configuration
- **Email Templates:** https://supabase.com/dashboard/project/nwuzxcpljlvwhpitwutf/auth/templates
- **Storage:** https://supabase.com/dashboard/project/nwuzxcpljlvwhpitwutf/storage/buckets
- **SQL Editor:** https://supabase.com/dashboard/project/nwuzxcpljlvwhpitwutf/sql/new

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Auth Helpers for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Storage Guide](https://supabase.com/docs/guides/storage)

---

**Last Updated:** 2025-01-22
**PrepGenie Project ID:** nwuzxcpljlvwhpitwutf
**Region:** ap-northeast-1 (Tokyo)
**Database Version:** PostgreSQL 17.6.1
