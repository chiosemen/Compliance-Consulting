# Medical Compliance Consulting (MCC) Platform

A comprehensive compliance management platform for medical practices, built with modern web technologies.

## 🏗️ Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL (Supabase)
- **Deployment**:
  - Frontend: Vercel
  - Backend: Render
  - Database: Supabase
- **CI/CD**: GitHub Actions

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Compliance-Consulting.git
   cd Compliance-Consulting
   ```

2. **Set up environment variables**
   ```bash
   ./scripts/setup-env.sh
   # Then edit .env.local with your actual values
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📦 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy

#### Frontend (Vercel)
```bash
npm install -g vercel
vercel --prod
```

#### Backend (Render)
- Push to `main` branch for auto-deployment
- Or use the Render dashboard to deploy manually

#### Database (Supabase)
```bash
npm install -g supabase
supabase db push
```

## 🔧 Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Optional but recommended
NEXTAUTH_SECRET=
NEXT_PUBLIC_API_URL=
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📝 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## 🐳 Docker

```bash
# Build and run with Docker Compose
docker-compose up -d

# Stop services
docker-compose down
```

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md)
- [API Documentation](./docs/API.md) *(Coming soon)*
- [Contributing Guide](./CONTRIBUTING.md) *(Coming soon)*

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Status**: 🚧 In Development

**Last Updated**: 2025-10-26
