# Production Deployment Guide

This guide covers deploying the Society Management System to production.

## Prerequisites

- Python 3.10+
- Node.js 18+
- MySQL/PostgreSQL database
- Cloudflare Tunnel configured
- Domain names configured (project.bhavikp.in, apiv2.bhavikp.in)

## Pre-Deployment Checklist

### 1. Generate Secret Key

```bash
cd backend
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Copy the generated key to your `.env` file.

### 2. Database Setup

Ensure your production database is configured:

```bash
# MySQL
mysql -u root -p
CREATE DATABASE society_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'society_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON society_management.* TO 'society_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Environment Variables

**Backend (`backend/.env`):**
```env
ENVIRONMENT=production
DEBUG=False
SECRET_KEY=your-generated-secret-key-here
ALLOWED_HOSTS=project.bhavikp.in,apiv2.bhavikp.in
CORS_ALLOWED_ORIGINS=https://project.bhavikp.in
DB_ENGINE=django.db.backends.mysql
DB_NAME=society_management
DB_USER=society_user
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=3306
USE_TLS=True
```

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_API_URL=https://apiv2.bhavikp.in/api
NODE_ENV=production
```

## Backend Deployment

### 1. Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install gunicorn  # Production WSGI server
```

### 2. Run Migrations

```bash
python manage.py migrate
```

### 3. Collect Static Files

```bash
python manage.py collectstatic --noinput
```

### 4. Create Superuser (if needed)

```bash
python manage.py createsuperuser
```

### 5. Run Production Server

**Option A: Using Gunicorn (Recommended)**

```bash
gunicorn config.wsgi:application \
    --bind 127.0.0.1:8000 \
    --workers 4 \
    --timeout 120 \
    --access-logfile logs/access.log \
    --error-logfile logs/error.log \
    --log-level info
```

**Option B: Using systemd service (Linux)**

Create `/etc/systemd/system/society-backend.service`:

```ini
[Unit]
Description=Society Management Backend
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/path/to/society/backend
Environment="PATH=/path/to/society/backend/venv/bin"
ExecStart=/path/to/society/backend/venv/bin/gunicorn \
    config.wsgi:application \
    --bind 127.0.0.1:8000 \
    --workers 4 \
    --timeout 120

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable society-backend
sudo systemctl start society-backend
```

## Frontend Deployment

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Build for Production

```bash
npm run build
```

### 3. Run Production Server

```bash
npm start
```

**Or using PM2 (Process Manager):**

```bash
npm install -g pm2
pm2 start npm --name "society-frontend" -- start
pm2 save
pm2 startup  # Follow instructions to enable on boot
```

## Cloudflare Configuration

### 1. SSL/TLS Settings

- Go to Cloudflare Dashboard → SSL/TLS
- Set encryption mode to **"Full"** (not "Full (strict)")
- Enable "Always Use HTTPS"
- Enable "Minimum TLS Version" (1.2 or higher)

### 2. Security Settings

- Enable WAF (Web Application Firewall)
- Enable DDoS protection
- Set up rate limiting
- Enable Bot Fight Mode

### 3. Performance

- Enable Auto Minify (JavaScript, CSS, HTML)
- Enable Brotli compression
- Enable HTTP/2 and HTTP/3

## Monitoring & Logging

### Backend Logs

Logs are automatically written to `backend/logs/django.log`:

```bash
tail -f backend/logs/django.log
```

### Frontend Logs

If using PM2:
```bash
pm2 logs society-frontend
```

## Backup Strategy

### Database Backup

```bash
# MySQL
mysqldump -u society_user -p society_management > backup_$(date +%Y%m%d).sql

# PostgreSQL
pg_dump -U society_user society_management > backup_$(date +%Y%m%d).sql
```

### Automated Backups (Cron)

Add to crontab:
```bash
0 2 * * * /path/to/backup-script.sh
```

## Security Checklist

- [ ] `DEBUG=False` in production
- [ ] Strong `SECRET_KEY` generated
- [ ] Database credentials secured
- [ ] CORS configured correctly
- [ ] SSL/TLS enabled
- [ ] Security headers configured
- [ ] Regular backups scheduled
- [ ] Firewall configured
- [ ] Cloudflare WAF enabled
- [ ] Rate limiting configured

## Performance Optimization

### Backend

1. **Database Indexing**: Ensure all foreign keys and frequently queried fields are indexed
2. **Caching**: Consider Redis for session storage and caching
3. **Connection Pooling**: Configure database connection pooling
4. **Static Files**: Serve static files via CDN or Nginx

### Frontend

1. **Image Optimization**: Use Next.js Image component
2. **Code Splitting**: Automatic with Next.js
3. **Caching**: Configure Cloudflare caching rules
4. **CDN**: Use Cloudflare CDN for static assets

## Troubleshooting

### Backend Issues

**Database Connection Errors:**
- Verify database credentials
- Check database is running
- Verify network connectivity

**Static Files Not Loading:**
- Run `python manage.py collectstatic`
- Check `STATIC_ROOT` permissions
- Verify Cloudflare static file caching

### Frontend Issues

**API Connection Errors:**
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check CORS settings in backend
- Verify backend is accessible

**Build Errors:**
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check for TypeScript errors

## Maintenance

### Regular Updates

1. **Dependencies**: Regularly update Python and Node.js packages
2. **Security Patches**: Monitor for security vulnerabilities
3. **Database**: Regular maintenance and optimization

### Monitoring

- Monitor server resources (CPU, memory, disk)
- Set up error tracking (Sentry, etc.)
- Monitor API response times
- Track user activity

## Rollback Procedure

If issues occur:

1. **Backend**: Stop service, restore from backup, restart
2. **Frontend**: Revert to previous build
3. **Database**: Restore from backup if needed

## Support

For issues or questions:
1. Check logs in `backend/logs/`
2. Review Cloudflare analytics
3. Check server resource usage
4. Review error tracking (if configured)

