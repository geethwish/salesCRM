# Sales CRM Application

A modern, full-stack Customer Relationship Management (CRM) application built with Next.js, TypeScript, MongoDB, and deployed on Vercel with automated CI/CD.

## 🚀 Features

- **Modern Tech Stack**: Next.js 15, React 19, TypeScript, MongoDB
- **State Management**: Redux Toolkit for global state, React Query for server state
- **Authentication**: JWT-based authentication with secure password hashing and form validation
- **Database**: MongoDB with Mongoose ODM, proper indexing, and user-scoped data isolation
- **UI Components**: Shadcn/ui components with Tailwind CSS and dark/light theme support
- **Form Validation**: Comprehensive form validation with Zod schemas and enhanced error UI
- **API Documentation**: Swagger/OpenAPI documentation with interactive UI
- **Testing**: Comprehensive test suite with Jest, Testing Library, and Playwright
- **Deployment**: Automated deployment to Vercel with GitHub Actions
- **Type Safety**: Full TypeScript implementation with strict mode

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB, Mongoose
- **State Management**: Redux Toolkit, React Query (@tanstack/react-query)
- **Authentication**: JWT, bcryptjs
- **UI Components**: Radix UI, Shadcn/ui, Lucide React
- **Forms & Validation**: React Hook Form, Zod
- **Testing**: Jest, Testing Library, Playwright
- **Deployment**: Vercel, GitHub Actions
- **Development**: ESLint, Prettier, Husky

## 📋 Prerequisites

- Node.js 18.17+ (recommended: Node.js 20 LTS)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd sales-crm
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your configuration
# MONGODB_URI=mongodb://localhost:27017/sales-crm
# JWT_SECRET=your-jwt-secret-here
```

### 3. Database Setup

```bash
# Start MongoDB (if running locally)
# macOS: brew services start mongodb/brew/mongodb-community
# Linux: sudo systemctl start mongod

# Seed the database
npm run seed
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### 5. Default Login

- **Email**: `admin@crm.com`
- **Password**: `password`

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

## 🚀 Deployment

This project includes automated deployment to Vercel using GitHub Actions.

### Quick Deployment Setup

1. **Run the setup script**:

   ```bash
   ./scripts/setup-vercel.sh
   ```

2. **Configure GitHub Secrets** (see `.github/README.md` for details):

   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
   - `MONGODB_URI`
   - `JWT_SECRET`

3. **Push to main branch** for automatic deployment

### Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel@latest

# Login and deploy
vercel login
vercel --prod
```

For detailed deployment instructions, see:

- [GitHub Actions Setup](./.github/README.md)

## 📁 Project Structure

```
sales-crm/
├── app/                        # Next.js App Router (pages and API routes)
│   ├── api/                    # API routes
│   │   ├── auth/               # Authentication endpoints (login, register, logout, me)
│   │   ├── docs/               # Swagger documentation endpoints
│   │   ├── health/             # Health check endpoint
│   │   ├── orders/             # Orders CRUD and stats endpoints
│   │   ├── seed/               # Database seeding endpoint
│   │   └── test/               # Test endpoints
│   ├── auth/                   # Authentication pages
│   │   ├── login/              # Login page
│   │   └── register/           # Registration page
│   ├── dashboard/              # Dashboard pages
│   │   └── page.tsx            # Main dashboard page
│   ├── globals.css             # Global styles and Tailwind CSS
│   ├── layout.tsx              # Root layout component
│   └── page.tsx                # Home page (redirects to auth/dashboard)
├── components/                 # React components
│   ├── auth/                   # Authentication components
│   │   ├── AuthLayout.tsx      # Authentication layout wrapper
│   │   ├── LoginForm.tsx       # Login form with validation
│   │   └── RegisterForm.tsx    # Registration form with validation
│   ├── common/                 # Common/shared components
│   │   └── ErrorBoundary.tsx   # Error boundary component
│   ├── dashboard/              # Dashboard-specific components
│   │   ├── Charts.tsx          # Analytics charts (Recharts)
│   │   ├── OrdersFilter.tsx    # Orders filtering component
│   │   ├── OrdersTable.tsx     # Orders data table with pagination
│   │   └── StatsCards.tsx      # Statistics cards component
│   └── ui/                     # UI components (shadcn/ui)
│       ├── button.tsx          # Button component
│       ├── checkbox.tsx        # Checkbox component
│       ├── form.tsx            # Form components with validation
│       ├── input.tsx           # Input component
│       ├── label.tsx           # Label component
│       ├── spinner.tsx         # Loading spinner component
│       └── theme-toggle.tsx    # Dark/light theme toggle
├── lib/                        # Core application libraries
│   ├── components/             # Shared component utilities
│   │   └── ui/                 # UI utility components
│   │       ├── PageTransition.tsx  # Page transition animations
│   │       └── Toast.tsx       # Toast notification system
│   ├── constants/              # Application constants
│   │   └── index.ts            # HTTP status codes, JWT config, etc.
│   ├── contexts/               # React contexts
│   │   └── AuthContext.tsx     # Authentication context (legacy)
│   ├── database/               # Database utilities
│   │   ├── connection.ts       # MongoDB connection management
│   │   └── utils.ts            # Database utility functions
│   ├── hooks/                  # Custom React hooks
│   │   └── useAuth.ts          # Authentication hook (Redux-based)
│   ├── middleware/             # API middleware
│   │   └── apiMiddleware.ts    # CORS, security, rate limiting
│   ├── models/                 # Mongoose models
│   │   ├── Order.ts            # Order model with validation
│   │   └── User.ts             # User model with authentication
│   ├── providers/              # React providers
│   │   ├── ReduxProvider.tsx   # Redux store provider
│   │   └── ThemeProvider.tsx   # Theme provider
│   ├── schemas/                # Zod validation schemas
│   │   └── auth.ts             # Authentication form schemas
│   ├── services/               # Business logic services
│   │   ├── apiService.ts       # API client with Axios interceptors
│   │   ├── orderService.ts     # Order business logic
│   │   └── userService.ts      # User business logic
│   ├── store/                  # Redux Toolkit store
│   │   ├── slices/             # Redux slices
│   │   │   ├── authSlice.ts    # Authentication state management
│   │   │   └── dashboardSlice.ts  # Dashboard state management
│   │   ├── hooks.ts            # Typed Redux hooks
│   │   └── index.ts            # Store configuration
│   ├── swagger/                # API documentation
│   │   └── config.ts           # Swagger/OpenAPI configuration
│   ├── types/                  # TypeScript type definitions
│   │   ├── auth.ts             # Authentication types
│   │   └── order.ts            # Order types
│   ├── utils/                  # Utility functions
│   │   ├── apiConfig.ts        # API configuration
│   │   ├── auth.ts             # Authentication utilities
│   │   ├── authUtils.ts        # Auth helper functions
│   │   ├── csvExport.ts        # CSV export functionality
│   │   ├── errorHandler.ts     # Error handling utilities
│   │   ├── httpClient.ts       # HTTP client configuration
│   │   ├── performance.ts      # Performance monitoring
│   │   └── validation.ts       # Validation utilities
│   └── utils.ts                # General utility functions (cn, etc.)
├── __tests__/                  # Test files
│   ├── api/                    # API endpoint tests
│   │   └── orders/             # Orders API tests
│   ├── auth/                   # Authentication tests
│   │   └── register.test.tsx   # Registration form tests
│   ├── components/             # Component tests
│   │   ├── auth/               # Authentication component tests
│   │   ├── dashboard/          # Dashboard component tests
│   │   └── ui/                 # UI component tests
│   ├── fixtures/               # Test fixtures and mock data
│   │   └── orderFixtures.ts    # Order test data
│   ├── setup/                  # Test setup and configuration
│   │   └── testSetup.ts        # Jest test setup
│   └── utils/                  # Test utilities
│       └── testHelpers.ts      # Test helper functions
├── __mocks__/                  # Jest mocks
│   ├── OrderModel.js           # Order model mock
│   ├── UserModel.js            # User model mock
│   ├── bson.js                 # BSON mock
│   ├── mongodb.js              # MongoDB mock
│   ├── mongoose.js             # Mongoose mock
│   └── uuid.js                 # UUID mock
├── docs/                       # Documentation
│   ├── documentation.md        # Technical documentation
│   └── installation.md         # Installation and setup guide
├── public/                     # Static assets
│   ├── file.svg                # File icon
│   ├── globe.svg               # Globe icon
│   ├── next.svg                # Next.js logo
│   ├── vercel.svg              # Vercel logo
│   └── window.svg              # Window icon
├── scripts/                    # Utility scripts
│   ├── seed.ts                 # Database seeding script
│   ├── setup-vercel.sh         # Vercel deployment setup
│   └── test-swagger.js         # Swagger specification test
├── coverage/                   # Test coverage reports
├── .github/                    # GitHub Actions workflows
├── middleware.ts               # Next.js middleware
├── package.json                # Dependencies and scripts
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── jest.config.mjs             # Jest testing configuration
├── playwright.config.ts        # Playwright E2E testing configuration
├── eslint.config.mjs           # ESLint configuration
├── next.config.ts              # Next.js configuration
└── vercel.json                 # Vercel deployment configuration
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with sample data

## 📚 Documentation

- [Technical Documentation](./docs/documentation.md) - Complete technical documentation covering architecture, technologies, API endpoints, database schema, and deployment
- [Installation Guide](./docs/installation.md) - Comprehensive installation and setup guide with troubleshooting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Check the [installation guide](./docs/installation.md)
- Check the [technical documentation](./docs/documentation.md)
