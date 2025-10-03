# 📚 Driving School Management System - Documentation

Welcome to the comprehensive documentation for the Driving School Management System. This documentation provides detailed information about the project architecture, features, setup, and usage.

## 📖 Documentation Structure

### 📋 [Requirements](./requirements/README.md)
Complete functional and non-functional requirements, user stories, and acceptance criteria for the driving school management system.

**Key Topics:**
- Functional Requirements (User Management, Booking System, Payments)
- Non-Functional Requirements (Performance, Security, Reliability)
- Technical Requirements (Technology Stack, Integration)
- Design Requirements (UI/UX, Accessibility)
- Success Criteria and Metrics

### 🎨 [Design System](./design/README.md)
Comprehensive design guidelines, component library, and visual standards for maintaining consistency across the application.

**Key Topics:**
- Visual Design System (Colors, Typography, Spacing)
- Component Library (Buttons, Forms, Cards, Navigation)
- Responsive Design Guidelines
- Animation and Transitions
- Accessibility Standards
- Brand Guidelines

### 🔌 [API Documentation](./api/README.md)
Complete REST API reference with endpoints, request/response formats, authentication, and integration examples.

**Key Topics:**
- Authentication Endpoints
- Booking Management API
- Payment Processing
- Admin Functions
- Error Handling
- SDK Examples

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MySQL 8.0+ or PostgreSQL 13+
- Git

### Installation

#### Option 1: Docker Setup (Recommended)
```bash
# Clone the repository
git clone <your-repo-url>
cd driving_school

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5001
```

#### Option 2: Manual Setup

**Backend Setup:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

**Frontend Setup:**
```bash
cd frontend
npm install
npm start
```

**Database Setup:**
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE driving_school;"

# Run schema
mysql -u root -p driving_school < database/schema.sql
```

## 🏗️ Architecture Overview

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (MySQL)       │
│   Port: 3000    │    │   Port: 5001    │    │   Port: 3306    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Static Assets │    │   External      │    │   File Storage  │
│   (Images, CSS) │    │   Services      │    │   (Uploads)     │
└─────────────────┘    │   (Stripe,      │    └─────────────────┘
                       │   Google, SMS)  │
                       └─────────────────┘
```

### Technology Stack

#### Frontend
- **Framework**: React 18 with hooks
- **Routing**: React Router DOM v6
- **State Management**: Context API + useReducer
- **Styling**: SCSS with CSS modules
- **HTTP Client**: Axios with interceptors
- **Payment**: Stripe React components
- **Animations**: Framer Motion

#### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js with middleware
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT with bcrypt
- **Payment**: Stripe integration
- **Email**: Nodemailer with Gmail SMTP
- **SMS**: Twilio integration

#### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (production)
- **SSL**: Let's Encrypt certificates
- **Monitoring**: Application logging

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Server Configuration
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=driving_school
DB_USER=root
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback

# Email Configuration (Gmail SMTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_character_app_password
EMAIL_FROM=noreply@drivingschool.com

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Twilio Configuration (Optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

#### Frontend (.env)
```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

## 🎯 Core Features

### 🔐 Authentication System
- **User Registration**: Email/password with role-based access
- **Login/Logout**: JWT-based authentication with refresh tokens
- **Password Management**: Secure hashing, reset, and change functionality
- **Google OAuth**: Social login integration
- **Session Management**: Automatic token refresh and logout

### 📅 Booking Management
- **Online Scheduling**: Real-time calendar with instructor availability
- **Package System**: Pre-defined lesson packages with pricing
- **Booking Modifications**: Reschedule and cancel bookings
- **Notifications**: Email and SMS confirmations
- **Conflict Detection**: Automatic scheduling conflict prevention

### 💳 Payment Processing
- **Stripe Integration**: Secure online payments
- **Multiple Payment Methods**: Cards, digital wallets
- **Payment History**: Complete transaction records
- **Invoice Generation**: Automated receipts and invoices
- **Refund Processing**: Admin-controlled refund system

### 📊 Progress Tracking
- **Student Dashboard**: Visual progress indicators
- **Lesson Completion**: Track completed lessons and milestones
- **Skill Assessment**: Instructor notes and evaluations
- **Progress Reports**: Detailed learning analytics
- **Test Readiness**: Assessment for driving test preparation

### 👨‍🏫 Instructor Tools
- **Schedule Management**: Availability and booking management
- **Student Profiles**: Access to student information and progress
- **Lesson Planning**: Tools for lesson preparation
- **Progress Notes**: Record student performance and feedback
- **Communication**: Direct messaging with students

### 🛠️ Admin Dashboard
- **User Management**: Create, update, and manage user accounts
- **Booking Oversight**: View and manage all bookings
- **Payment Analytics**: Revenue tracking and reporting
- **System Configuration**: Manage packages, pricing, and settings
- **Reporting**: Generate detailed business reports

## 📱 User Interfaces

### Public Website
- **Homepage**: Hero section, services overview, testimonials
- **About Us**: School information, team profiles, mission
- **Services**: Detailed service descriptions and offerings
- **Packages**: Pricing plans and course packages
- **Contact**: Contact form and location information
- **Instructor Profiles**: Individual instructor pages

### Student Dashboard
- **My Bookings**: View and manage lesson bookings
- **Progress Tracking**: Visual progress indicators and milestones
- **Payment History**: Transaction records and invoices
- **Profile Management**: Update personal information
- **Messages**: Communication with instructors

### Instructor Dashboard
- **Schedule**: Personal calendar and availability
- **Students**: List of assigned students and their progress
- **Bookings**: Manage lesson bookings and confirmations
- **Progress Notes**: Record student performance
- **Messages**: Communication with students

### Admin Dashboard
- **Overview**: Key metrics and system status
- **Users**: Manage all user accounts and roles
- **Bookings**: Oversee all bookings and scheduling
- **Payments**: Monitor transactions and revenue
- **Reports**: Generate business analytics and reports
- **Settings**: Configure system parameters

## 🔒 Security Features

### Authentication Security
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevent brute force attacks
- **Session Management**: Automatic logout and token refresh

### Data Protection
- **HTTPS Encryption**: All communications encrypted
- **Input Validation**: Server-side validation and sanitization
- **SQL Injection Prevention**: ORM-based database queries
- **XSS Protection**: Input sanitization and output encoding

### Access Control
- **Role-Based Access**: Student, Instructor, Admin roles
- **Permission System**: Granular access control
- **API Security**: Authentication required for protected endpoints
- **CORS Configuration**: Secure cross-origin requests

## 🚀 Deployment

### Development Environment
```bash
# Start development servers
npm run dev  # Backend
npm start    # Frontend

# Run with Docker
docker-compose up -d
```

### Production Deployment

#### Docker Production
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

#### Manual Production Setup
```bash
# Build frontend
cd frontend
npm run build

# Start backend
cd ../backend
NODE_ENV=production npm start
```

### Environment Configuration
- Set `NODE_ENV=production`
- Use strong JWT secrets
- Enable HTTPS with SSL certificates
- Configure production database
- Set up monitoring and logging

## 🧪 Testing

### Test Accounts
- **Admin**: `admin@drivingschool.com` / `Admin123!`
- **Instructor**: `instructor@drivingschool.com` / `Instructor123!`
- **Student**: Register new account

### Stripe Test Cards
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Insufficient Funds**: `4000 0000 0000 9995`
- Use expiry: `12/25`, CVC: `123`

### API Testing
```bash
# Health check
curl http://localhost:5001/health

# Test authentication
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@drivingschool.com","password":"Admin123!"}'
```

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 5001
lsof -ti:5001 | xargs kill -9
```

#### Database Connection Issues
```bash
# Check if MySQL is running
brew services list | grep mysql

# Start MySQL
brew services start mysql

# Create database
mysql -u root -p -e "CREATE DATABASE driving_school;"
```

#### Docker Issues
```bash
# Reset Docker containers
docker-compose down -v
docker-compose up -d

# View logs
docker-compose logs backend
docker-compose logs frontend
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# Backend debug mode
NODE_ENV=development DEBUG=app:* npm run dev
```

## 📊 Performance Metrics

### Target Performance
- **Page Load Time**: < 3 seconds
- **API Response Time**: < 500ms
- **Database Query Time**: < 100ms
- **Mobile Performance**: > 90 Lighthouse score
- **Accessibility**: > 95 Lighthouse score

### Optimization Features
- **Code Splitting**: Lazy loading for faster initial load
- **Image Optimization**: Proper formats and compression
- **Database Indexing**: Optimized queries
- **Caching**: Redis for frequently accessed data
- **CDN Ready**: Static asset optimization

## 🔄 Development Workflow

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
```

### Code Standards
- **ESLint**: JavaScript linting
- **Prettier**: Code formatting
- **Conventional Commits**: Standardized commit messages
- **Code Review**: All changes require review
- **Testing**: Write tests for new features

### Development Tools
- **Hot Reloading**: Automatic refresh on changes
- **Source Maps**: Debug-friendly error messages
- **Error Boundaries**: Graceful error handling
- **Development Server**: Local development environment

## 📈 Roadmap

### Phase 2 (Q2 2024)
- Mobile application (React Native)
- Advanced analytics dashboard
- AI-powered recommendations
- Video lesson integration
- Multi-language support

### Phase 3 (Q3 2024)
- Community features and forums
- Advanced scheduling algorithms
- Integration with external calendar systems
- Advanced payment options (installments)
- White-label solution for other schools

## 🤝 Contributing

### Getting Started
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests for new features
5. Submit a pull request

### Development Guidelines
- Follow the existing code style
- Write comprehensive tests
- Update documentation
- Ensure mobile responsiveness
- Follow accessibility guidelines

## 📞 Support

### Getting Help
1. Check this documentation
2. Review the troubleshooting section
3. Check GitHub Issues
4. Contact the development team

### Resources
- **API Documentation**: [./api/README.md](./api/README.md)
- **Design System**: [./design/README.md](./design/README.md)
- **Requirements**: [./requirements/README.md](./requirements/README.md)
- **GitHub Repository**: [Project Repository]
- **Live Demo**: [Demo URL]

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](../LICENSE) file for details.

---

**Ready to revolutionize driving school management! 🚗💻🎓**

*Built with ❤️ for driving schools worldwide*

---

## 📝 Changelog

### Version 1.0.0 (2024-01-15)
- Initial release
- Complete authentication system
- Booking management
- Payment processing
- Admin dashboard
- Student dashboard
- Instructor tools
- Mobile-responsive design
- API documentation
- Comprehensive testing

### Recent Updates
- Fixed about route navigation issue
- Added products.csv to gitignore
- Enhanced documentation structure
- Improved error handling
- Performance optimizations
