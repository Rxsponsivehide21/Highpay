# HighPay — USDT to UGX (Uganda)

**Tagline:** Your money, fast and secure.  
**Location:** Zone 7, Mutungo, Kampala  
**Model:** Flat 2% · ~7 tx/day avg · 200+ monthly users

## Quick start

Open `index.html` or:

```bash
python3 -m http.server 5500
```

## Supabase

1. Create a project at https://supabase.com  
2. SQL Editor → run `supabase/schema.sql`  
3. Auth → enable Google / GitHub / Phone as needed  
4. Auth → URL Configuration → add your site URL  
5. In `assets/main.js` set:

```js
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
const WHATSAPP_NUMBER = '2567XXXXXXXX';
```

## Legal

- `terms.html` — Terms of Service  
- `privacy.html` — Privacy Policy  

## Structure

```
highpay/
├── index.html
├── terms.html / privacy.html
├── learn.html / community.html / advocacy.html / blog.html / login.html
├── blog/...
├── assets/
└── supabase/schema.sql
```
