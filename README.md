# Sales CRM Application

A modern, full-stack Customer Relationship Management (CRM) application built with Next.js, TypeScript, MongoDB, and deployed on Vercel with automated CI/CD.

## 🚀 Features

- **Modern Tech Stack**: Next.js 15, React 19, TypeScript, MongoDB
- **Authentication**: JWT-based authentication with secure password hashing
- **Database**: MongoDB with Mongoose ODM and proper indexing
- **UI Components**: Shadcn/ui components with Tailwind CSS
- **Testing**: Comprehensive test suite with Jest and Testing Library
- **Deployment**: Automated deployment to Vercel with GitHub Actions
- **Type Safety**: Full TypeScript implementation with strict mode

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB, Mongoose
- **Authentication**: JWT, bcryptjs
- **UI Components**: Radix UI, Shadcn/ui, Lucide React
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

- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- [GitHub Actions Setup](./.github/README.md)

## 📁 Project Structure

```
sales-crm/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   └── ui/               # UI components (shadcn/ui)
├── lib/                  # Utility libraries
│   ├── database/         # Database connection
│   ├── models/           # Mongoose models
│   ├── services/         # Business logic
│   └── utils/            # Utility functions
├── __tests__/            # Test files
├── .github/              # GitHub Actions workflows
└── scripts/              # Utility scripts
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

- [MongoDB Migration Guide](./MONGODB_MIGRATION.md)
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- [GitHub Actions Setup](./.github/README.md)
- [Search Functionality](./SEARCH_FUNCTIONALITY.md)

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

- Check the [documentation](./MONGODB_MIGRATION.md)
- Review [troubleshooting guide](./.github/README.md#troubleshooting)
- Open an issue on GitHub
