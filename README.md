# Frontend - Mail Application

React frontend cho ứng dụng mail với authentication và 3-column email dashboard.

## 🚀 Features

- JWT Authentication với auto-refresh
- Google OAuth 2.0 Sign-In
- 3-column email interface (folders, list, detail)
- Email compose, send, star, delete
- Multi-tab synchronization
- Responsive design
- Dark mode ready

## 📦 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TanStack Router** - Type-safe routing
- **TanStack Query** - Data fetching
- **Zustand** - State management
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Axios** - HTTP client

## 🏗️ Development

### Prerequisites

- Node.js 18+
- pnpm (recommended) hoặc npm

### Setup

```bash
# Install dependencies
pnpm install

# Create .env file
cat > .env << EOF
VITE_API_BASE_URL=http://localhost:3000
VITE_USE_COOKIE_AUTH=false
EOF

# Start development server
pnpm run dev
```

Application sẽ chạy tại `http://localhost:5173`

### Environment Variables

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:3000

# Use httpOnly cookies for refresh token (optional)
VITE_USE_COOKIE_AUTH=false
```

## 🎨 UI Components

Sử dụng [shadcn/ui](https://ui.shadcn.com/) components:

- Forms (Input, Button, Checkbox)
- Dialogs & Modals
- Dropdowns & Menus
- Cards & Badges
- Toast notifications
- Accordion, Tabs

## 📁 Project Structure

```
src/
├── main.tsx              # Application entry
├── App.tsx               # Root component
├── components/
│   ├── pages/            # Page components
│   │   ├── home.tsx
│   │   ├── log-in.tsx
│   │   ├── sign-up.tsx
│   │   ├── profile.tsx
│   │   └── emails/       # Email dashboard components
│   └── ui/               # shadcn/ui components
├── hooks/
│   ├── useAuthStore.ts   # Zustand auth store
│   ├── use-toast.ts      # Toast hook
│   └── react-query/      # TanStack Query hooks
├── routes/               # TanStack Router routes
│   ├── __root.tsx
│   ├── _authenticated/   # Protected routes
│   └── _authentication/  # Auth routes
├── services/
│   ├── apiClient.ts      # Axios instance với interceptors
│   ├── auth.ts           # Auth API calls
│   ├── email.ts          # Email API calls
│   ├── authSync.ts       # Multi-tab sync
│   └── token.ts          # Token management
├── lib/
│   ├── utils.ts          # Utility functions
│   ├── consts.ts         # Constants
│   ├── enums.ts          # Enums
│   └── interfaces.ts     # TypeScript interfaces
└── styles/
    └── globals.css       # Global styles
```

## 🔐 Authentication Flow

```
1. User login → Backend returns access + refresh tokens
2. Access token → Zustand store (in-memory)
3. Refresh token → localStorage (hoặc httpOnly cookie)
4. Auto-refresh 60s before expiry
5. On 401 error → Refresh token → Retry request
6. On refresh fail → Logout → Redirect to login
```

## 🐳 Docker

### Build Image

```bash
docker build -t frontend:latest \
  --build-arg VITE_API_BASE_URL=https://mail.nguyenanhhao.site/api \
  .
```

### Run Container

```bash
docker run -p 80:80 frontend:latest
```

## 🚢 Production Deployment

Frontend được deploy tự động qua DevOps repository.

### Manual Build for Production

```bash
# Build
pnpm run build

# Preview production build
pnpm run preview
```

### GitHub Container Registry

```bash
# Build and push
docker build -t ghcr.io/awad-final-project/frontend:latest \
  --build-arg VITE_API_BASE_URL=https://mail.nguyenanhhao.site/api \
  .
docker push ghcr.io/awad-final-project/frontend:latest
```

## 🎯 Features Detail

### Email Dashboard

- **Mailbox Folders**: Inbox, Starred, Sent, Drafts, Archive, Trash
- **Email List**: Preview, read/unread status, star
- **Email Detail**: Full content, reply/forward/delete actions
- **Compose**: Send email với validation
- **Search**: Filter emails (planned)

### Authentication

- **Email/Password**: Traditional login
- **Google OAuth**: One-click sign-in
- **Protected Routes**: Redirect to login if not authenticated
- **Auto Logout**: On token expiration
- **Multi-tab Sync**: Login/logout synced across tabs

## 📝 Scripts

- `pnpm run dev` - Start dev server
- `pnpm run build` - Build for production
- `pnpm run preview` - Preview production build
- `pnpm run lint` - Run ESLint
- `pnpm run type-check` - TypeScript check

## 🧪 Testing

```bash
# Run tests (setup pending)
pnpm run test

# Run E2E tests (setup pending)
pnpm run test:e2e
```

## 🎨 Styling

- **Tailwind CSS**: Utility-first CSS
- **CSS Variables**: Theme customization
- **Dark Mode**: Ready (not implemented yet)
- **Responsive**: Mobile, tablet, desktop

## 🔗 Related Repositories

- [Backend](https://github.com/awad-final-project/backend) - NestJS API
- [DevOps](https://github.com/awad-final-project/devops) - Deployment configs

## 📄 License

MIT
