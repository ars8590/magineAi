# How to Get API Keys & Setup Credentials

## 🔑 Google Gemini API Key

### Step-by-Step Guide:

1. **Go to Google AI Studio**
   - Visit: https://makersuite.google.com/app/apikey
   - Or: https://aistudio.google.com/app/apikey

2. **Sign In**
   - Use your Google account to sign in

3. **Create API Key**
   - Click **"Create API Key"** button
   - Select an existing Google Cloud project or create a new one
   - The API key will be generated automatically

4. **Copy the Key**
   - Copy the generated API key (it looks like: `AIzaSy...`)
   - ⚠️ **Important:** Keep this key secret! Don't commit it to git.

5. **Add to Backend**
   - Open `backend/.env` file
   - Add: `GEMINI_API_KEY=your-copied-key-here`
   - Save the file

### Alternative: Using Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create a project
3. Enable **Generative Language API**
4. Go to **APIs & Services** > **Credentials**
5. Click **Create Credentials** > **API Key**
6. Copy the key and add to `.env`

---

## 🖼️ Imagen API Key (Optional)

### Option 1: Use Gemini Key (Recommended for Testing)
- For now, you can use the same key as Gemini
- Add to `.env`: `IMAGEN_API_KEY=your-gemini-key-here`

### Option 2: Google Cloud Imagen API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Vertex AI API** and **Imagen API**
3. Create a service account
4. Generate a JSON key file
5. Use the service account credentials

### Option 3: Alternative Image Generation Services
- **Stable Diffusion API**: https://stability.ai/
- **DALL-E API**: https://platform.openai.com/
- **Midjourney API**: (if available)

---

## 👤 Create Admin User

### Method 1: Using the Script (Easiest)

1. **Make sure your `.env` file has Supabase credentials:**
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. **Run the script:**
   ```bash
   cd backend
   npm run create-admin
   ```
   
   Or with custom username/password:
   ```bash
   npm run create-admin myadmin mypassword123
   ```

3. **The script will:**
   - Generate a bcrypt hash of your password
   - Show you the SQL to run (if you prefer manual)
   - Optionally insert the admin directly into Supabase

### Method 2: Manual SQL (Using Online Tool)

1. **Generate Password Hash:**
   - Go to: https://bcrypt-generator.com/
   - Enter your password (e.g., `admin123`)
   - Set rounds to `10`
   - Click **Generate**
   - Copy the hash (starts with `$2a$10$...`)

2. **Run SQL in Supabase:**
   - Go to your Supabase project
   - Open **SQL Editor**
   - Run this SQL (replace with your hash):
   ```sql
   INSERT INTO admins (username, password_hash) 
   VALUES ('admin', '$2a$10$your-generated-hash-here');
   ```

### Method 3: Using Node.js REPL

```bash
cd backend
node
```

Then in the Node.js console:
```javascript
const bcrypt = require('bcryptjs');
bcrypt.hash('your-password', 10).then(hash => console.log(hash));
```

Copy the hash and use it in SQL.

---

## 🔐 Generate JWT Secret

The JWT secret is used to sign and verify authentication tokens. You need a strong, random string.

### Method 1: Using the Script (Easiest)

```bash
cd backend
npm run generate-jwt
```

This will generate a secure 64-character hex string and display it. Copy it to your `.env` file.

### Method 2: Using Node.js Command

```bash
# In backend directory
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and add to `backend/.env`:
```env
JWT_SECRET=your-generated-secret-here
```

### Method 3: Using PowerShell (Windows)

```powershell
# Generate random bytes and convert to hex
[Convert]::ToHexString((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### Method 4: Using Online Generator

- Visit: https://randomkeygen.com/
- Use a "CodeIgniter Encryption Keys" (256-bit)
- Copy and use as your JWT_SECRET

**⚠️ Important:**
- Use a different secret for production
- Keep it secret - never commit to git
- Minimum 32 characters recommended
- Use cryptographically secure random generation

---

## 📋 Complete Setup Checklist

### Environment Variables Needed:

**Backend (`backend/.env`):**
- [x] `PORT=4000` (default)
- [ ] `JWT_SECRET` ← **Generate using: `npm run generate-jwt`**
- [x] `SUPABASE_URL` (from Supabase dashboard)
- [x] `SUPABASE_SERVICE_ROLE_KEY` (from Supabase dashboard)
- [ ] `GEMINI_API_KEY` ← **Get this from Google AI Studio**
- [ ] `IMAGEN_API_KEY` ← **Can use same as Gemini for now**
- [x] `CORS_ORIGINS` (default: `http://localhost:3000`)

**Frontend (`frontend/.env.local`):**
- [x] `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000`

### Quick Commands:

```bash
# Generate JWT secret
cd backend
npm run generate-jwt

# Create admin user
npm run create-admin

# Test backend connection
curl http://localhost:4000/health
```

---

## 🔒 Security Notes

1. **Never commit `.env` files to git** - They're already in `.gitignore`
2. **Use strong passwords** for admin accounts
3. **Rotate API keys** periodically
4. **Use environment-specific keys** (dev vs production)
5. **Limit API key permissions** in Google Cloud Console

---

## 🆘 Troubleshooting

### "API key not valid" error
- Check that you copied the entire key
- Verify no extra spaces or line breaks
- Make sure the API is enabled in Google Cloud Console

### "Admin login fails"
- Verify the password hash matches
- Check that the admin was inserted correctly
- Try regenerating the hash and re-inserting

### "Supabase connection error"
- Verify `SUPABASE_URL` format (should end with `.supabase.co`)
- Check `SUPABASE_SERVICE_ROLE_KEY` is the service role key (not anon key)
- Ensure your Supabase project is active

