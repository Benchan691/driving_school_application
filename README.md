# The Truth Driving School - Web Application

> **Professional driving school management system with online payments, booking, and student management**

🌐 **Live Website:** [https://thetruthdrivingschool.ca](https://thetruthdrivingschool.ca)

---

## 🚀 Quick Start

```bash
# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Start tunnel (for production)
./tunnel-manager.sh
```

---

## 📚 Documentation

### Main Guides
- **[Complete Guide](docs/Guide.md)** - Setup, deployment, payment, and operations
- **[Security Guide](docs/Security.md)** - Security audit, fixes, and best practices

### Quick Links
- [Environment Setup](docs/Guide.md#environment-setup)
- [Deployment](docs/Guide.md#deployment-guide)
- [Payment Configuration](docs/Guide.md#payment--stripe-configuration)
- [Price Management](docs/Guide.md#price-management)
- [Tunnel Management](docs/Guide.md#tunnel-management)
- [Troubleshooting](docs/Guide.md#faq--troubleshooting)

---

## 🏗️ Tech Stack

### Frontend
- **React** - UI framework
- **Stripe** - Payment processing
- **Framer Motion** - Animations
- **React Router** - Navigation
- **Axios** - API calls

### Backend
- **Node.js + Express** - API server
- **PostgreSQL** - Database
- **Redis** - Caching & brute force protection
- **JWT** - Authentication
- **Sequelize** - ORM
- **Nodemailer** - Email service

### Infrastructure
- **Docker** - Containerization
- **Nginx** - Reverse proxy
- **Cloudflare Tunnel** - Secure access
- **Cloudflare** - DNS & SSL

---

## 🔐 Security

- ✅ **SQL Injection Protection** - Fixed
- ✅ **XSS Protection** - Fixed
- ✅ **Brute Force Protection** - Redis-based
- ✅ **JWT Authentication** - Enhanced
- ✅ **HTTPS Only** - Via Cloudflare
- ✅ **Security Headers** - Helmet
- ✅ **Input Validation** - Comprehensive

**Security Score:** 72/100 (improved from 35/100)

[View Full Security Audit →](docs/Security.md)

---

## 💳 Payment System

- **Provider:** Stripe
- **Mode:** 🔴 LIVE (Real payments enabled)
- **Currency:** CAD (Canadian Dollars)
- **Packages:** 6 active packages ($80 - $1000)

**Pricing:**
- 1 Hour Driving Lesson: $80
- 1.5 Hours Lessons: $110  
- Package A (4 lessons): $420
- Package B (6 lessons): $610
- Package C (10 lessons): $1000
- Road Test: $170

[View Payment Guide →](docs/Guide.md#payment--stripe-configuration)

---

## 🚀 Deployment Status

- **Environment:** Production
- **Domain:** thetruthdrivingschool.ca
- **SSL:** Enabled via Cloudflare
- **Services:** All running
- **Tunnel:** Active

### Check Status
```bash
# Services
docker-compose ps

# Tunnel
./tunnel-manager.sh  # Press 4 for status

# Website
curl https://thetruthdrivingschool.ca
```

---

## 📁 Project Structure

```
driving_school/
├── backend/           # Node.js API server
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── services/
│   └── tests/
├── frontend/          # React application
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       └── context/
├── database/          # SQL schemas & seeds
├── docs/             # Documentation
│   ├── Guide.md      # Complete guide
│   └── Security.md   # Security guide
├── nginx/            # Reverse proxy config
└── tunnel-manager.sh # Cloudflare tunnel manager
```

---

## 🔧 Configuration

### Environment Variables
Required in `.env` file:
- `DATABASE_URL` - PostgreSQL connection
- `JWT_SECRET` - JWT secret key
- `STRIPE_SECRET_KEY` - Stripe secret (live)
- `STRIPE_PUBLISHABLE_KEY` - Stripe public (live)
- `FRONTEND_URL` - Production URL
- `REDIS_HOST` - Redis host
- `SESSION_SECRET` - Session secret

[View Full Configuration →](docs/Guide.md#environment-setup)

---

## 🛠️ Common Commands

### Development
```bash
# Install dependencies
cd backend && npm install
cd frontend && npm install

# Start development
docker-compose up -d
```

### Production
```bash
# Build frontend
cd frontend && npm run build

# Start production
docker-compose -f docker-compose.prod.yml up -d

# Start tunnel
./tunnel-manager.sh
```

### Database
```bash
# Connect to database
docker exec -it driving_school_db psql -U postgres -d driving_school

# View packages
docker exec -i driving_school_db psql -U postgres -d driving_school -c \
  "SELECT name, price FROM lesson_packages;"

# Backup
docker exec -i driving_school_db pg_dump -U postgres driving_school > backup.sql
```

### Tunnel
```bash
# Interactive manager
./tunnel-manager.sh

# Quick status
./tunnel-manager.sh  # Press 4

# View logs
./tunnel-manager.sh  # Press 6
```

---

## 📊 Features

### Student Features
- ✅ Online registration & login
- ✅ Browse & purchase lesson packages
- ✅ Stripe payment integration
- ✅ Book driving lessons
- ✅ View lesson history & progress
- ✅ Email receipts & confirmations

### Admin Features
- ✅ User management
- ✅ Booking management
- ✅ Payment tracking
- ✅ Package management
- ✅ Instructor management
- ✅ Analytics & reporting

### Technical Features
- ✅ Responsive design
- ✅ Real-time updates
- ✅ Secure authentication
- ✅ Payment processing
- ✅ Email notifications
- ✅ Database backups
- ✅ Error monitoring

---

## 🔗 Important Links

### Production
- **Website:** https://thetruthdrivingschool.ca
- **Admin:** https://thetruthdrivingschool.ca/admin
- **API:** https://thetruthdrivingschool.ca/api

### External Services
- **Stripe Dashboard:** https://dashboard.stripe.com
- **Cloudflare Dashboard:** https://dash.cloudflare.com

### Documentation
- **Complete Guide:** [docs/Guide.md](docs/Guide.md)
- **Security Guide:** [docs/Security.md](docs/Security.md)
- **API Docs:** [docs/api/README.md](docs/api/README.md)

---

## 📞 Support

### Documentation
- Main Guide: [docs/Guide.md](docs/Guide.md)
- Security: [docs/Security.md](docs/Security.md)
- Troubleshooting: [docs/Guide.md#faq--troubleshooting](docs/Guide.md#faq--troubleshooting)

### Quick Help
```bash
# Check logs
docker-compose logs backend --tail=50

# Check tunnel
./tunnel-manager.sh  # Press 4

# Check database
docker exec -i driving_school_db psql -U postgres -d driving_school -c "SELECT 1;"
```

---

## 📈 Status

- **Development:** ✅ Complete
- **Production:** ✅ Live
- **Payments:** 🔴 Live Mode (Real money)
- **Security:** 🟡 B- (72/100)
- **Documentation:** ✅ Complete

---

## 📝 License

Private - The Truth Driving School

---

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| Start all services | `docker-compose up -d` |
| Stop all services | `docker-compose down` |
| View logs | `docker-compose logs -f` |
| Start tunnel | `./tunnel-manager.sh` → Press 1 |
| Check status | `./tunnel-manager.sh` → Press 4 |
| Update prices | See [Price Management](docs/Guide.md#price-management) |
| Security audit | See [Security Guide](docs/Security.md) |
| Deploy | See [Deployment](docs/Guide.md#deployment-guide) |

---

**Built with ❤️ for The Truth Driving School**  
**Last Updated:** October 9, 2025
