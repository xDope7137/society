# Production Quick Start Guide

Quick steps to deploy to production.

## 1. Generate Secret Key

```bash
cd backend
python scripts/generate_secret_key.py
```

Copy the generated key.

## 2. Configure Environment Variables

**Backend (`backend/.env`):**
```env
ENVIRONMENT=production
DEBUG=False
SECRET_KEY=<paste-generated-key-here>
ALLOWED_HOSTS=project.bhavikp.in,apiv2.bhavikp.in
CORS_ALLOWED_ORIGINS=https://project.bhavikp.in
USE_TLS=True
# ... add your database credentials
```

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_API_URL=https://apiv2.bhavikp.in/api
NODE_ENV=production
```

## 3. Setup Backend

```bash
cd backend

# Install production dependencies
pip install gunicorn

# Run production setup
python scripts/setup_production.py

# Start with Gunicorn
gunicorn config.wsgi:application --bind 127.0.0.1:8000 --workers 4
```

## 4. Setup Frontend

```bash
cd frontend

# Build for production
npm run build

# Start production server
npm start
```

## 5. Verify

- Visit: https://project.bhavikp.in
- Test login with admin credentials
- Check browser console for errors
- Verify API calls work

## Important Security Notes

1. ✅ Set `DEBUG=False` in production
2. ✅ Use strong `SECRET_KEY` (generated above)
3. ✅ Secure database credentials
4. ✅ Configure Cloudflare SSL/TLS to "Full"
5. ✅ Enable Cloudflare WAF and security features

For detailed deployment instructions, see `PRODUCTION_DEPLOYMENT.md`.

