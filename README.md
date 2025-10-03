# 🚗 Driving School Management System

A comprehensive, modern web application for driving school management with complete authentication system, online booking capabilities, payment processing, and student management.

## ✨ Features

### 🔐 Authentication System
- **User Registration** - Students, instructors, and admin can create accounts
- **User Login/Logout** - Secure JWT-based authentication with refresh tokens
- **Role-based Access Control** - Student, Instructor, and Admin roles
- **Password Management** - Secure password hashing, change, and reset functionality
- **Profile Management** - Users can update their information
- **Session Management** - JWT tokens with refresh capabilities
- **Google OAuth Integration** - Social login support
- **Form Validation** - Comprehensive frontend and backend validation

### 🏠 Core Website Features
- **Homepage** - Hero section with image slideshow, services overview, testimonials
- **About Us** - Team information, mission, and values
- **Services** - Driving lessons, theory classes, test preparation
- **Instructors** - Profile pages, qualifications, experience, ratings
- **Packages** - Pricing plans and course packages
- **Contact** - Contact form and location information
- **Responsive Design** - Works perfectly on all devices

### 💳 Advanced Features
- **Online Payment Integration** - Stripe payment processing with test and live modes
- **Booking System** - Online lesson scheduling and management
- **Progress Tracking Dashboard** - Visual progress indicators for students
- **Admin Dashboard** - Complete administrative control panel
- **Student Dashboard** - Personal booking and progress management
- **Email Notifications** - Gmail SMTP integration for receipts and notifications
- **SMS Notifications** - Twilio integration for booking confirmations
- **File Upload System** - Profile pictures and document uploads
- **Image Gallery** - Slideshow and result photos showcase

## 📁 Project Structure

```
driving_school/
├── frontend/                    # React frontend application
│   ├── public/                  # Static assets
│   │   ├── images/             # Website images
│   │   ├── icons/              # Favicon and icons
│   │   ├── pictures/           # Slideshow and result images
│   │   └── index.html          # Main HTML file
│   ├── src/                    # Source code
│   │   ├── components/         # Reusable UI components
│   │   │   ├── auth/           # Authentication components
│   │   │   │   ├── Login.jsx   # Login form
│   │   │   │   ├── Register.jsx # Registration form
│   │   │   │   ├── ForgotPassword.jsx # Password recovery
│   │   │   │   ├── ResetPassword.jsx # Password reset
│   │   │   │   └── Profile.jsx # User profile
│   │   │   ├── common/         # Shared components
│   │   │   │   ├── Header.jsx  # Navigation header
│   │   │   │   ├── Footer.jsx  # Site footer
│   │   │   │   ├── LoadingSpinner.jsx # Loading indicators
│   │   │   │   └── TodayTimetable.jsx # Timetable component
│   │   │   ├── layout/         # Layout components
│   │   │   │   └── ProtectedRoute.jsx # Route protection
│   │   │   ├── pages/          # Page-specific components
│   │   │   │   ├── Home.jsx    # Homepage
│   │   │   │   ├── AboutUs.jsx # About page
│   │   │   │   ├── Services.jsx # Services page
│   │   │   │   ├── Contact.jsx # Contact page
│   │   │   │   ├── Packages.jsx # Packages page
│   │   │   │   ├── Dashboard.jsx # Student dashboard
│   │   │   │   ├── Progress.jsx # Progress tracking
│   │   │   │   └── AdminDashboard.jsx # Admin panel
│   │   │   └── payment/        # Payment components
│   │   │       ├── PaymentForm.jsx # Payment form
│   │   │       └── PaymentModal.jsx # Payment modal
│   │   ├── pages/              # Main page components
│   │   │   ├── AuthCallback.jsx # OAuth callback
│   │   │   ├── PaymentSuccess.jsx # Payment success
│   │   │   └── PaymentCancelled.jsx # Payment cancelled
│   │   ├── styles/             # SCSS stylesheets
│   │   │   ├── components/     # Component styles
│   │   │   ├── pages/          # Page styles
│   │   │   ├── variables.scss  # CSS variables
│   │   │   └── main.scss       # Main stylesheet
│   │   ├── context/            # React context
│   │   │   └── AuthContext.jsx # Authentication context
│   │   ├── utils/              # Utility functions
│   │   │   ├── apiBase.js      # API configuration
│   │   │   └── schoolConfig.js # School configuration
│   │   ├── config/             # Configuration files
│   │   │   └── stripe.js       # Stripe configuration
│   │   ├── content/            # Content data
│   │   │   ├── home.json       # Homepage content
│   │   │   ├── packages.json   # Packages data
│   │   │   └── school.json     # School information
│   │   └── App.js              # Main App component
│   ├── build/                  # Production build
│   ├── package.json            # Frontend dependencies
│   └── Dockerfile              # Frontend Docker configuration
├── backend/                     # Node.js/Express backend
│   ├── src/                    # Source code
│   │   ├── controllers/        # Route controllers
│   │   │   └── authController.js # Authentication logic
│   │   ├── models/             # Database models
│   │   │   ├── index.js        # Model associations
│   │   │   ├── User.js         # User model
│   │   │   ├── Instructor.js   # Instructor model
│   │   │   ├── Booking.js      # Booking model
│   │   │   ├── Package.js      # Package model
│   │   │   ├── UserPackage.js  # User-Package relationship
│   │   │   └── ContactMessage.js # Contact form model
│   │   ├── routes/             # API routes
│   │   │   ├── auth.js         # Authentication routes
│   │   │   ├── bookings.js     # Booking routes
│   │   │   ├── instructors.js  # Instructor routes
│   │   │   ├── packages.js     # Package routes
│   │   │   ├── payments.js     # Payment routes
│   │   │   ├── contact.js      # Contact routes
│   │   │   ├── admin.bookings.js # Admin booking routes
│   │   │   ├── admin.payments.js # Admin payment routes
│   │   │   └── admin.users.js  # Admin user routes
│   │   ├── middleware/         # Custom middleware
│   │   │   ├── auth.js         # Authentication middleware
│   │   │   ├── errorHandler.js # Error handling
│   │   │   └── validation.js   # Input validation
│   │   ├── services/           # Business logic
│   │   │   └── emailService.js # Email service
│   │   ├── utils/              # Utility functions
│   │   │   └── jwt.js          # JWT utilities
│   │   ├── config/             # Configuration files
│   │   │   ├── database.js     # Database config
│   │   │   ├── passport.js     # Passport config
│   │   │   └── stripe.js       # Stripe config
│   │   ├── database/           # Database setup
│   │   │   └── init.js         # Database initialization
│   │   ├── scripts/            # Utility scripts
│   │   │   ├── checkPasswordFields.js # Password validation
│   │   │   ├── checkUsers.js   # User checking
│   │   │   ├── clearBookingData.js # Data cleanup
│   │   │   ├── clearUserPackages.js # Package cleanup
│   │   │   └── resetUserPasswords.js # Password reset
│   │   ├── tests/              # Test files
│   │   ├── uploads/            # File uploads
│   │   ├── pictures/           # Image assets
│   │   │   ├── slideshow/      # Slideshow images
│   │   │   └── result/         # Result images
│   │   ├── app.js              # Main server file
│   │   ├── package.json        # Backend dependencies
│   │   └── Dockerfile          # Backend Docker configuration
├── database/                    # Database files and migrations
│   ├── migrations/             # Database schema changes
│   │   ├── clear_all_booking_data.sql
│   │   ├── remove_complete_status_and_verification.sql
│   │   └── remove_user_fields.sql
│   ├── seeds/                  # Sample data
│   └── schema.sql              # Database schema
├── docs/                       # Documentation
│   ├── api/                    # API documentation
│   ├── design/                 # Design mockups and wireframes
│   └── requirements/           # Project requirements
├── ssl/                        # SSL certificates
├── nginx.conf/                 # Nginx configuration
├── docker-compose.yml          # Docker configuration
├── products.csv                # Product data
└── README.md                   # This file
```

## 🛠 Technology Stack

### Frontend
- **Framework**: React 18 with hooks
- **Routing**: React Router DOM v6
- **State Management**: Context API + useReducer
- **Styling**: SCSS with CSS modules
- **UI Components**: Custom components with responsive design
- **Forms**: React Hook Form with validation
- **HTTP Client**: Axios with interceptors
- **Payment**: Stripe React components

### Backend
- **Runtime**: Node.js 16+
- **Framework**: Express.js with middleware
- **Database**: MySQL with Sequelize ORM (PostgreSQL support available)
- **Authentication**: JWT with bcrypt
- **Validation**: Express-validator
- **Payment**: Stripe integration
- **Email**: Nodemailer with Gmail SMTP
- **SMS**: Twilio integration
- **File Upload**: Multer

### Security Features
- **JWT Authentication** with refresh tokens
- **Password Hashing** using bcrypt
- **Input Validation** and sanitization
- **Rate Limiting** and DDoS protection
- **CORS Configuration** for security
- **Helmet.js** for security headers
- **SQL Injection Protection** via ORM

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **MySQL** 8.0+ (or PostgreSQL 13+)
- **Git**

### Option 1: Docker Setup (Recommended)
```bash
# Clone the repository
git clone <your-repo-url>
cd driving_school

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Services will be available at:**
- 🌐 **Frontend**: http://localhost:3000
- 🔧 **Backend API**: http://localhost:5001
- 🗄️ **Database**: localhost:3306 (MySQL) or localhost:5432 (PostgreSQL)

### Option 2: Manual Setup

#### 1. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your database credentials

# Start development server
npm run dev
```

#### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

#### 3. Database Setup
```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE driving_school;

# Run schema
source database/schema.sql
```

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

# Email Configuration (Gmail SMTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_character_app_password
EMAIL_FROM=noreply@drivingschool.com

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

#### Frontend (.env)
```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

### Service Configuration

#### 1. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized URLs:
   - **JavaScript Origins**: `http://localhost:3000`
   - **Redirect URIs**: `http://localhost:5001/api/auth/google/callback`

#### 2. Gmail SMTP Setup
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Google Account → Security → 2-Step Verification → App passwords
   - Select "Mail" and generate password
3. Use the 16-character password in `EMAIL_PASS`

#### 3. Stripe Payment Setup
1. Sign up at [stripe.com](https://stripe.com)
2. Get test keys from dashboard
3. Add keys to both frontend and backend `.env` files
4. Test with card: `4242 4242 4242 4242` (expiry: 12/25, CVC: 123)

#### 4. Twilio SMS Setup (Optional)
1. Sign up at [twilio.com](https://www.twilio.com)
2. Get Account SID and Auth Token
3. Purchase a phone number
4. Add credentials to backend `.env`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Refresh access token
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Instructors
- `GET /api/instructors` - Get all instructors
- `GET /api/instructors/:id` - Get instructor details

### Packages
- `GET /api/packages` - Get all packages

### Payments
- `POST /api/payments/create-payment-intent` - Create payment intent
- `POST /api/payments/confirm-payment` - Confirm payment
- `GET /api/payments/history` - Get payment history

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/bookings` - Get all bookings
- `PUT /api/admin/users/:id` - Update user

### Other
- `GET /health` - Health check
- `POST /api/contact` - Contact form submission

## 🧪 Testing

### Test Accounts
- **Admin**: `admin@drivingschool.com` / `Admin123!`
- **Student**: Register new account
- **Instructor**: Register new account

### Test Cards (Stripe)
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Insufficient Funds**: 4000 0000 0000 9995
- Use expiry: 12/25, CVC: 123

### Health Checks
```bash
# Backend health check
curl http://localhost:5001/health

# Payment endpoint test
curl http://localhost:5001/api/payments/test
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

#### Stripe Payment Issues
1. Verify Stripe keys are correctly set in both frontend and backend `.env`
2. Check browser console for error messages
3. Ensure using test keys for development
4. Verify card details are correct

#### Email Issues
1. Ensure 2FA is enabled on Gmail account
2. Use App Password, not regular password
3. Check spam folder for test emails

#### Docker Issues
```bash
# Reset Docker containers
docker-compose down -v
docker-compose up -d

# View logs
docker-compose logs backend
docker-compose logs frontend
```

## 🚀 Deployment

### Production Build
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm run build
```

### Environment Setup
- Set `NODE_ENV=production`
- Use strong JWT secrets
- Enable HTTPS
- Set up monitoring
- Configure reverse proxy (nginx)

### Docker Production
```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 Features Status

### ✅ Completed Features
- **Complete Website** with all pages (Home, About, Services, Contact, Packages)
- **Authentication System** with JWT and OAuth
- **User Management** with role-based access
- **Booking System** for lesson scheduling
- **Payment Processing** with Stripe integration
- **Admin Dashboard** for management
- **Student Dashboard** for progress tracking
- **Email Notifications** with Gmail SMTP
- **Responsive Design** for all devices
- **Image Slideshow** and gallery
- **Contact Form** with validation
- **Password Management** and recovery
- **Profile Management** system

### 🔄 In Progress
- **SMS Notifications** (Twilio integration)
- **Advanced Scheduling** features
- **Progress Analytics** dashboard
- **Mobile App** (React Native)

### 📋 Planned Features
- **Video Lessons** integration
- **AI-powered Recommendations**
- **Community Features**
- **Advanced Reporting**
- **Multi-language Support**

## 🎨 Design System

### Colors
- **Primary**: #2563eb (Blue)
- **Secondary**: #7c3aed (Purple)
- **Accent**: #f59e0b (Orange)
- **Success**: #10b981 (Green)
- **Error**: #ef4444 (Red)

### Typography
- **Primary Font**: Inter
- **Secondary Font**: Poppins
- **Monospace**: JetBrains Mono

### Components
- **Responsive Design**: Mobile-first approach
- **Modern UI**: Clean, professional interface
- **Accessibility**: ARIA labels and keyboard navigation
- **Animations**: Smooth transitions

## 🔐 Security Features

- **JWT Authentication** with refresh tokens
- **Password Hashing** using bcrypt with salt rounds
- **Input Validation** and sanitization on all endpoints
- **Rate Limiting** to prevent abuse
- **CORS Configuration** for secure cross-origin requests
- **Helmet.js** for security headers
- **SQL Injection Protection** via Sequelize ORM
- **XSS Protection** with input sanitization
- **CSRF Protection** for state-changing operations

## 📈 Performance

### Optimizations
- **Code Splitting** for faster initial load
- **Image Optimization** with proper formats and sizes
- **Database Indexing** for faster queries
- **Caching** for frequently accessed data
- **Compression** for API responses
- **CDN Ready** for static assets

### Metrics
- **Page Load Time**: < 3 seconds
- **API Response Time**: < 500ms
- **Mobile Performance**: > 90 Lighthouse score
- **Accessibility**: > 95 Lighthouse score

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write tests for new features
- Update documentation for API changes
- Use conventional commit messages
- Ensure mobile responsiveness

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

### Getting Help
1. Check the troubleshooting section above
2. Review console logs for errors
3. Verify environment variables are set correctly
4. Test individual components
5. Check API endpoints with curl or Postman

### Contact
- **Email**: chankokpan0728@gmail.com

## 🎉 Acknowledgments

- **Stripe** for payment processing
- **React** and **Node.js** communities

---

**Ready to revolutionize driving school management! 🚗💻🎓**

*Built with ❤️ for driving schools worldwide*
