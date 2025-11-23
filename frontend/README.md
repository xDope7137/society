# Society Management Frontend

Modern, professional web application for apartment society management built with Next.js 14, Tailwind CSS, and shadcn/ui.

## Features

### Implemented (Phase 1 MVP)

✅ **Authentication**
- Login & Registration
- JWT-based authentication
- Role-based access control
- Password management

✅ **Dashboard**
- Real-time statistics
- Quick action cards
- Recent notices display
- Activity overview

✅ **Notice Board**
- Create and view notices
- Priority-based filtering
- Category organization
- Search functionality

✅ **Visitor Management**
- Register visitors
- Check-in/Check-out system
- Active visitors tracking
- Visitor history

✅ **Complaint Tracking**
- File complaints
- Track status updates
- Category-based filtering
- Priority management

✅ **Billing & Payments**
- View bills
- Payment history
- Razorpay integration ready
- Bill breakdowns

✅ **Resident Directory**
- Searchable directory
- Flat-wise listing
- Contact information
- Occupancy status

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **State Management**: React Hooks + Context
- **Form Handling**: React Hook Form
- **Notifications**: Custom Toast System

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running on http://localhost:8000

### Installation

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Update `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

3. Run development server:
```bash
npm run dev
```

4. Open http://localhost:3000

## Project Structure

```
frontend/
├── app/                      # Next.js App Router
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page (redirects to login)
│   ├── login/               # Login page
│   ├── register/            # Registration page
│   └── dashboard/           # Protected dashboard
│       ├── layout.tsx       # Dashboard layout with sidebar
│       ├── page.tsx         # Dashboard home
│       ├── notices/         # Notice board
│       ├── visitors/        # Visitor management
│       ├── complaints/      # Complaint system
│       ├── billing/         # Billing & payments
│       └── directory/       # Resident directory
├── components/
│   └── ui/                  # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── table.tsx
│       ├── toast.tsx
│       └── toaster.tsx
├── contexts/
│   └── AuthContext.tsx      # Authentication context
├── hooks/
│   └── use-toast.ts         # Toast notification hook
├── lib/
│   ├── api.ts               # API client & endpoints
│   └── utils.ts             # Utility functions
├── public/                  # Static assets
├── next.config.js           # Next.js configuration
├── tailwind.config.ts       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies
```

## API Integration

The app connects to the Django REST API. All API calls are centralized in `lib/api.ts`:

```typescript
// Example usage
import { noticesAPI } from '@/lib/api';

const notices = await noticesAPI.getNotices();
```

### Available API Modules:
- `authAPI` - Authentication & user management
- `societyAPI` - Society & flat management
- `noticesAPI` - Notice board operations
- `visitorsAPI` - Visitor management
- `complaintsAPI` - Complaint tracking
- `billingAPI` - Billing & payments

## Features in Detail

### Dashboard Layout
- Responsive sidebar navigation
- Collapsible on mobile
- Role-based menu items
- User profile section
- Logout functionality

### Authentication Flow
1. User logs in with email/password
2. JWT tokens stored in localStorage
3. Automatic token refresh
4. Protected routes redirect to login

### Styling System
- Tailwind CSS for utility classes
- Custom design tokens for consistency
- shadcn/ui for accessible components
- Responsive design (mobile-first)

## Design System

### Color Palette
- Primary: Blue (#3B82F6)
- Secondary: Gray shades
- Success: Green
- Warning: Yellow/Orange
- Danger: Red

### Typography
- Font: Inter
- Headings: Bold, clear hierarchy
- Body: Regular, readable sizes

### Components
All UI components follow shadcn/ui patterns:
- Accessible
- Customizable
- Composable
- Type-safe

## Development

### Adding a New Page

1. Create page in `app/dashboard/[name]/page.tsx`
2. Add route to sidebar in `app/dashboard/layout.tsx`
3. Create API methods in `lib/api.ts`
4. Use existing UI components

### Adding a New Component

```bash
# Add shadcn/ui component
npx shadcn-ui@latest add [component-name]
```

## Building for Production

```bash
npm run build
npm run start
```

## Environment Variables

Required environment variables:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

For production, update to your production API URL.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Server-side rendering with Next.js
- Optimized images
- Code splitting
- Lazy loading
- Efficient API calls

## Security

- JWT token authentication
- Secure HTTP-only cookies (production)
- HTTPS enforcement (production)
- Input validation
- XSS protection

## Troubleshooting

### API Connection Issues
- Verify backend is running
- Check NEXT_PUBLIC_API_URL in .env.local
- Check browser console for CORS errors

### Authentication Issues
- Clear localStorage and try again
- Check token expiration
- Verify backend JWT settings

### Build Issues
- Delete `.next` folder and rebuild
- Clear npm cache: `npm cache clean --force`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## Future Enhancements (Phase 2)

- Dark mode
- Mobile apps (React Native)
- Real-time notifications
- Advanced analytics
- Document management
- Facility booking
- Staff management
- WhatsApp integration

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## License

Proprietary - Society Management System

## Support

For issues or questions, contact the development team.

