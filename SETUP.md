# MagineAI Setup Guide

## 🚀 Next Steps After Installation

### 1. **Set Up Environment Variables**

#### Backend (`backend/.env`)
Create a `.env` file in the `backend` directory with:

```env
# Server Configuration
PORT=4000

# JWT Secret (generate using: npm run generate-jwt in backend folder)
# See GET_API_KEYS.md for instructions
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Supabase Configuration
# Get these from your Supabase project settings > API
SUPABASE_URL=https://mvloiuflatehaxlzepun.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12bG9pdWZsYXRlaGF4bHplcHVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTAzMTI5MCwiZXhwIjoyMDgwNjA3MjkwfQ.10OyZO7rhmW-QRBNs1j_pEY_vVQR7fpI9oiY8JOSO5Q

# AI API Keys
# Get Gemini API key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your-gemini-api-key
# Imagen API key (if using separate key, otherwise can use same as Gemini)
IMAGEN_API_KEY=your-imagen-api-key

# CORS Origins (comma-separated, or * for all)
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

#### Frontend (`frontend/.env.local`)
Create a `.env.local` file in the `frontend` directory with:

```env
# Backend API URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

### 2. **Set Up Supabase Database**

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the following SQL to create all tables:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Preferences table
CREATE TABLE preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  age INTEGER NOT NULL,
  genre TEXT NOT NULL,
  theme TEXT NOT NULL,
  keywords TEXT[],
  language TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated Content table
CREATE TABLE generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  introduction TEXT NOT NULL,
  main_story TEXT NOT NULL,
  character_highlights TEXT,
  conclusion TEXT NOT NULL,
  image_urls TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feedback table
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES generated_content(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admins table
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_preferences_user_id ON preferences(user_id);
CREATE INDEX idx_generated_content_user_id ON generated_content(user_id);
CREATE INDEX idx_generated_content_status ON generated_content(status);
CREATE INDEX idx_feedback_content_id ON feedback(content_id);
```

3. **Create an admin user** (run this in SQL Editor after hashing a password):

```sql
-- Insert admin user (password: 'admin123' - CHANGE THIS!)
-- Use bcrypt to hash: https://bcrypt-generator.com/
-- Example hash for 'admin123': $2a$10$rOzJqZqZqZqZqZqZqZqZqO
INSERT INTO admins (username, password_hash) 
VALUES ('admin', '$2a$10$rOzJqZqZqZqZqZqZqZqZqO');
```

**⚠️ Important:** Generate a proper bcrypt hash for your admin password using [bcrypt-generator.com](https://bcrypt-generator.com/) or Node.js.

### 3. **Get API Keys**

#### Google Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add it to `backend/.env` as `GEMINI_API_KEY`

#### Imagen API Key
- If using Google Cloud Imagen, you'll need a GCP project with Imagen API enabled
- For now, you can use the same key as Gemini or leave it empty (the code will handle it)

### 4. **Test the Setup**

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```
   You should see: `MagineAI API running on port 4000`

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   You should see: `Ready on http://localhost:3000`

3. **Test Backend Health:**
   - Open browser: `http://localhost:4000/health`
   - Should return: `{"ok":true}`

4. **Test Frontend:**
   - Open browser: `http://localhost:3000`
   - You should see the home page with the input form

### 5. **Complete AI Integration**

The AI service is currently stubbed. To complete the integration:

1. **Install Google AI SDK:**
   ```bash
   cd backend
   npm install @google/generative-ai
   ```

2. **Update `backend/src/services/ai.ts`:**
   - Replace the stub functions with actual Gemini API calls
   - For Imagen, use Google Cloud Imagen API or another image generation service

### 6. **Optional: Set Up Image Storage**

If you want to store generated images:

1. **Supabase Storage:**
   - Go to Storage in Supabase dashboard
   - Create a bucket named `magazine-images`
   - Set it to public or configure RLS policies

2. **Update `backend/src/services/storage.ts`:**
   - Add image upload functionality using Supabase Storage client

## 🎯 Quick Start Checklist

- [ ] Backend `.env` file created with all variables
- [ ] Frontend `.env.local` file created
- [ ] Supabase project created
- [ ] All database tables created
- [ ] Admin user created in database
- [ ] Gemini API key obtained and added
- [ ] Backend server running (`npm run dev` in backend/)
- [ ] Frontend server running (`npm run dev` in frontend/)
- [ ] Health check passes (`http://localhost:4000/health`)
- [ ] Frontend loads (`http://localhost:3000`)

## 🐛 Troubleshooting

### Backend won't start
- Check that all environment variables are set
- Verify Supabase URL and key are correct
- Check port 4000 is not in use

### Frontend can't connect to backend
- Verify `NEXT_PUBLIC_API_BASE_URL` matches backend URL
- Check CORS settings in backend
- Ensure backend is running

### Database errors
- Verify all tables are created
- Check Supabase connection credentials
- Ensure RLS policies allow access (or disable for development)

### AI generation not working
- Verify API keys are correct
- Check API quotas/limits
- Review error logs in backend console

## 📚 Next Steps

Once everything is running:
1. Test the full flow: Generate → Preview → Download → Feedback
2. Set up admin dashboard and test moderation
3. Customize the UI theme and colors
4. Deploy to production (Cloud Run + Firebase Hosting)

