# Society Management System - Phase 1 MVP

A comprehensive web application for apartment society management built with Django REST Framework and Next.js 14.

## Project Overview

This is a modern, professional society management system designed for Indian apartment complexes. It provides essential features for managing residents, visitors, complaints, billing, and communication.

## Architecture

```
society-management/
├── backend/          # Django REST API
│   ├── config/      # Django settings
│   ├── users/       # User management & auth
│   ├── society/     # Society & flat models
│   ├── notices/     # Notice board
│   ├── visitors/    # Visitor management
│   ├── complaints/  # Complaint tracking
│   └── billing/     # Billing & payments
└── frontend/        # Next.js web app
    ├── app/         # Pages & routes
    ├── components/  # UI components
    ├── lib/         # API client & utilities
    └── hooks/       # Custom React hooks
```

## Tech Stack

### Backend
- Django 5.0
- Django REST Framework
- PostgreSQL
- JWT Authentication

### Frontend
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- shadcn/ui components
- Axios

## Features Implemented

### ✅ Phase 1 MVP Complete

1. **User Authentication**
   - Login/Registration
   - JWT-based auth
   - Role-based access (Admin, Committee, Resident, Security)
   - Profile management

2. **Dashboard**
   - Statistics overview
   - Recent notices
   - Quick actions
   - Activity tracking

3. **Notice Board**
   - Create/view notices
   - Priority levels
   - Categories
   - Search & filter

4. **Visitor Management**
   - Register visitors
   - Check-in/out system
   - Active visitor tracking
   - Visitor history

5. **Complaint Tracking**
   - File complaints
   - Status updates
   - Assignment system
   - Category-based filtering

6. **Billing & Payments**
   - Bill generation
   - Payment tracking
   - Manual payment recording
   - Payment history

7. **Resident Directory**
   - Searchable directory
   - Flat-wise listing
   - Contact information
   - Occupancy status

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Backend Setup

1. Create virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up database:
```bash
# Create PostgreSQL database
createdb society_management

# Copy environment file
cp .env.example .env
# Edit .env with your database credentials
```

4. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

5. Create superuser:
```bash
python manage.py createsuperuser
```

6. Run development server:
```bash
python manage.py runserver
```

API will be available at http://localhost:8000

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Set up environment:
```bash
cp .env.example .env.local
```

3. Run development server:
```bash
npm run dev
```

Frontend will be available at http://localhost:3000

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/api/docs/
- Admin Panel: http://localhost:8000/admin/

## User Roles

- **ADMIN**: Full system access
- **COMMITTEE**: Manage notices, complaints, residents
- **RESIDENT**: View notices, file complaints, view bills
- **SECURITY**: Manage visitors, view notices

## Default Credentials

After running the development setup, create users through:
1. Admin panel (http://localhost:8000/admin/)
2. Registration page (http://localhost:3000/register)

## Project Status

**Phase 1 MVP**: ✅ COMPLETED

All core features have been implemented:
- ✅ Backend API (Django REST Framework)
- ✅ Frontend Web App (Next.js)
- ✅ Authentication System
- ✅ Dashboard
- ✅ Notice Board
- ✅ Visitor Management
- ✅ Complaint Tracking
- ✅ Billing & Payments
- ✅ Resident Directory

## Next Steps (Phase 2)

- [ ] Facility booking system
- [ ] Staff/vendor management
- [ ] Document repository
- [ ] Discussion forums
- [ ] Mobile apps (React Native)
- [ ] WhatsApp integration
- [ ] Advanced analytics
- [ ] Email/SMS notifications

## Development Workflow

1. Backend runs on port 8000
2. Frontend runs on port 3000
3. Frontend makes API calls to backend
4. JWT tokens handle authentication

## Testing

### Backend
```bash
cd backend
python manage.py test
```

### Frontend
```bash
cd frontend
npm run test
```

## Deployment

### Backend (Django)
1. Set DEBUG=False in production
2. Configure proper SECRET_KEY
3. Set up PostgreSQL database
4. Collect static files
5. Use Gunicorn/uWSGI
6. Set up Nginx reverse proxy

### Frontend (Next.js)
1. Build production bundle: `npm run build`
2. Deploy to Vercel/Netlify or self-host
3. Update API_URL to production backend
4. Enable HTTPS

## Environment Variables

### Backend (.env)
```
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_URL=postgresql://...
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## Security

- JWT authentication
- Role-based access control
- CORS configured
- Input validation
- SQL injection prevention (Django ORM)
- XSS protection

## Performance

- Database indexing
- API pagination
- Lazy loading
- Code splitting
- Optimized queries

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Proprietary - Society Management System

## Support

For issues or questions, contact the development team.

## Acknowledgments

- Django REST Framework
- Next.js
- Tailwind CSS
- shadcn/ui
- Radix UI

