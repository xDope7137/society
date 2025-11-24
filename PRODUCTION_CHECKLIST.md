# Production Deployment Checklist

Use this checklist to ensure your production deployment is secure and properly configured.

## Pre-Deployment

### Backend Configuration
- [ ] `ENVIRONMENT=production` in `.env`
- [ ] `DEBUG=False` in `.env`
- [ ] Strong `SECRET_KEY` generated and set
- [ ] Database credentials configured
- [ ] `ALLOWED_HOSTS` includes production domains
- [ ] `CORS_ALLOWED_ORIGINS` includes frontend domain
- [ ] `USE_TLS=True` in `.env`

### Frontend Configuration
- [ ] `NEXT_PUBLIC_API_URL` points to production API
- [ ] `NODE_ENV=production` set
- [ ] Production build completed successfully

### Database
- [ ] Production database created
- [ ] Database user with appropriate permissions
- [ ] Migrations run successfully
- [ ] Initial data seeded (if needed)

### Security
- [ ] Secret key generated (not default)
- [ ] Database password is strong
- [ ] CORS configured correctly
- [ ] SSL/TLS enabled
- [ ] Security headers configured

## Deployment Steps

### Backend
- [ ] Dependencies installed (`pip install -r requirements.txt`)
- [ ] Virtual environment activated
- [ ] Migrations run (`python manage.py migrate`)
- [ ] Static files collected (`python manage.py collectstatic`)
- [ ] Logs directory created
- [ ] Gunicorn installed
- [ ] Server started (Gunicorn or systemd service)

### Frontend
- [ ] Dependencies installed (`npm install`)
- [ ] Production build completed (`npm run build`)
- [ ] Production server started (`npm start` or PM2)

### Cloudflare
- [ ] SSL/TLS mode set to "Full"
- [ ] Always Use HTTPS enabled
- [ ] WAF enabled
- [ ] DDoS protection enabled
- [ ] Rate limiting configured
- [ ] Tunnels running and connected

## Post-Deployment Verification

### Functionality
- [ ] Frontend loads at https://project.bhavikp.in
- [ ] Backend API accessible at https://apiv2.bhavikp.in/api
- [ ] Login works with admin credentials
- [ ] API calls succeed (check browser network tab)
- [ ] No CORS errors in console
- [ ] No SSL certificate errors

### Security
- [ ] `DEBUG=False` verified (no debug info in errors)
- [ ] Security headers present (check with browser dev tools)
- [ ] HTTPS enforced
- [ ] No sensitive data in logs
- [ ] Admin panel accessible (if needed)

### Performance
- [ ] Page load times acceptable
- [ ] API response times acceptable
- [ ] Static files loading correctly
- [ ] Images optimized

### Monitoring
- [ ] Logs directory created and writable
- [ ] Error logging working
- [ ] Server resources monitored
- [ ] Backup strategy in place

## Maintenance

### Regular Tasks
- [ ] Monitor server resources
- [ ] Check logs for errors
- [ ] Review security updates
- [ ] Backup database regularly
- [ ] Update dependencies periodically

### Backup
- [ ] Database backup script created
- [ ] Backup schedule configured
- [ ] Backup location secure
- [ ] Backup restoration tested

## Emergency Procedures

### Rollback Plan
- [ ] Previous version backed up
- [ ] Database backup available
- [ ] Rollback procedure documented
- [ ] Team notified of rollback process

### Incident Response
- [ ] Contact information documented
- [ ] Escalation procedure defined
- [ ] Monitoring alerts configured

## Documentation

- [ ] Production deployment guide reviewed
- [ ] Environment variables documented
- [ ] Server configuration documented
- [ ] Backup/restore procedures documented
- [ ] Troubleshooting guide available

---

**Last Updated:** $(date)
**Deployed By:** ________________
**Deployment Date:** ________________
**Version:** ________________

