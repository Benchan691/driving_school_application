# Driving School Complete Guide

> **Comprehensive guide for setup, deployment, payment management, and daily operations**

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Environment Setup](#environment-setup)
3. [Deployment Guide](#deployment-guide)
4. [Payment & Stripe Configuration](#payment--stripe-configuration)
5. [Price Management](#price-management)
6. [Tunnel Management](#tunnel-management)
7. [Quick Reference Commands](#quick-reference-commands)
8. [Local Device Hosting](#local-device-hosting)
9. [FAQ & Troubleshooting](#faq--troubleshooting)

---

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Node.js 16+ and npm
- PostgreSQL (via Docker)
- Cloudflare account (for tunnel)
- Stripe account (for payments)

### Quick Setup Commands

```bash
# Clone and navigate to project
cd /Users/alextruong/Documents/driving_school

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend frontend
```

### Your Website
- **Production URL:** https://thetruthdrivingschool.ca
- **Frontend:** Port 3000 (dev), served via nginx (prod)
- **Backend API:** Port 5002
- **Database:** Port 5432

---

## ⚙️ Environment Setup

### Required Environment Variables

Create `.env` file in project root:

```bash
# Database Configuration
DATABASE_URL=postgresql://postgres:password@postgres:5432/driving_school
POSTGRES_DB=driving_school
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password_here

# JWT & Security
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_REFRESH_SECRET=your-super-secret-refresh-key-minimum-32-characters
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
SESSION_SECRET=your-strong-session-secret-here

# Stripe Payment Configuration (LIVE MODE)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Application URLs
FRONTEND_URL=https://thetruthdrivingschool.ca
REACT_APP_API_BASE=https://thetruthdrivingschool.ca

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Redis (for brute force protection)
REDIS_HOST=redis
REDIS_PORT=6379

# Environment
NODE_ENV=production
```

### Docker Compose Setup

Your `docker-compose.yml` should include:
- PostgreSQL database
- Backend API server
- Frontend React app
- Nginx reverse proxy
- Redis for caching

### Initial Setup Steps

1. **Install Dependencies:**
   ```bash
   # Backend
   cd backend && npm install
   
   # Frontend
   cd frontend && npm install
   ```

2. **Database Setup:**
   ```bash
   # Start database
   docker-compose up -d postgres
   
   # Run migrations
   docker exec -i driving_school_db psql -U postgres -d driving_school < database/schema.sql
   ```

3. **Seed Initial Data:**
   ```bash
   # Seed packages
   docker exec -i driving_school_db psql -U postgres -d driving_school < database/seed_packages.sql
   ```

4. **Build Frontend:**
   ```bash
   cd frontend
   npm run build
   ```

5. **Start All Services:**
   ```bash
   docker-compose up -d
   ```

---

## 🚀 Deployment Guide

### Production Deployment

#### Prerequisites
- Server with Docker installed
- Domain name configured
- Cloudflare account for tunnel
- SSL certificates (via Cloudflare)

#### Deployment Steps

1. **Prepare Production Environment:**
   ```bash
   # Update .env with production values
   # Ensure all secrets are strong and unique
   ```

2. **Build Production Images:**
   ```bash
   # Frontend production build
   cd frontend
   npm run build
   
   # Build Docker images
   docker-compose -f docker-compose.prod.yml build
   ```

3. **Start Production Services:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **Configure Cloudflare Tunnel:**
   ```bash
   # Install cloudflared
   brew install cloudflared
   
   # Login to Cloudflare
   cloudflared tunnel login
   
   # Create tunnel
   cloudflared tunnel create thetruthdrivingschool
   
   # Configure tunnel (tunnel-config.yml already created)
   
   # Start tunnel
   ./tunnel-manager.sh
   # Choose option 1 to start
   ```

5. **Verify Deployment:**
   ```bash
   # Check services
   docker-compose ps
   
   # Test website
   curl https://thetruthdrivingschool.ca
   
   # Check tunnel status
   ./tunnel-manager.sh
   # Choose option 4
   ```

#### Health Checks

```bash
# Backend health
curl http://localhost:5002/health

# Database connection
docker exec -i driving_school_db psql -U postgres -d driving_school -c "SELECT 1;"

# Frontend serving
curl http://localhost:3000
```

---

## 💳 Payment & Stripe Configuration

### Stripe Live Mode Setup

#### Current Status
- **Mode:** 🔴 LIVE (Real payments enabled)
- **Currency:** CAD (Canadian Dollars)
- **Website:** https://thetruthdrivingschool.ca

#### Live API Keys

**Backend (Secret Key):**
```
sk_live_YOUR_STRIPE_SECRET_KEY_HERE
```

**Frontend (Publishable Key):**
```
pk_live_YOUR_STRIPE_PUBLISHABLE_KEY_HERE
```

**⚠️ IMPORTANT:** Keep your live Stripe keys secure! Never commit them to Git. Store them in `.env.production` file which is gitignored.

#### Package Pricing

| Package | Price | Original | Lessons |
|---------|-------|----------|---------|
| 1 Hour Driving Lesson | $80 CAD | $110 | 1 |
| 1.5 Hours Driving Lessons | $110 CAD | $150 | 1 |
| Package A | $420 CAD | $600 | 4 |
| Package B | $610 CAD | $1000 | 6 |
| Package C | $1000 CAD | $1800 | 10 |
| Road Test | $170 CAD | $220 | 1 |

#### Payment Flow

```
Customer → Packages Page → Login → Select Package
    ↓
Payment Modal → Stripe Checkout (Hosted)
    ↓
Payment Processing → Success/Failure
    ↓
UserPackage Created → Receipt Email → Dashboard
```

#### Testing Payments

**Use real card for testing:**
1. Go to https://thetruthdrivingschool.ca/packages
2. Login to your account
3. Click "Buy Now" on any package
4. Complete payment with your own card
5. Verify in Stripe Dashboard

**Monitor Payments:**
- Dashboard: https://dashboard.stripe.com/payments
- Logs: `docker-compose logs backend | grep -i stripe`

#### Switching Modes

**To Test Mode:**
```bash
# Update .env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Restart services
docker-compose restart backend
cd frontend && npm run build
docker-compose restart frontend nginx
```

#### Refund Process

```bash
# Via Stripe Dashboard
# 1. Go to https://dashboard.stripe.com/payments
# 2. Find payment
# 3. Click "Refund"
# 4. Enter amount
# 5. Confirm
```

---

## 💰 Price Management

### Database as Single Source of Truth

**Important:** Prices are now synchronized. The database is the single source - both frontend display and payment processing use database prices.

### Update Prices

#### Method 1: Quick SQL Update
```bash
docker exec -i driving_school_db psql -U postgres -d driving_school -c \
  "UPDATE lesson_packages SET price = 85.00, original_price = 120.00 WHERE name = '1 Hour Driving Lesson';"
```

#### Method 2: Bulk Update
Create `update_prices.sql`:
```sql
UPDATE lesson_packages SET price = 85.00, original_price = 115.00 WHERE name = '1 Hour Driving Lesson';
UPDATE lesson_packages SET price = 120.00, original_price = 160.00 WHERE name = '1.5 Hours Driving Lessons';
UPDATE lesson_packages SET price = 450.00, original_price = 650.00 WHERE name = 'Package A';
UPDATE lesson_packages SET price = 650.00, original_price = 1050.00 WHERE name = 'Package B';
UPDATE lesson_packages SET price = 1050.00, original_price = 1900.00 WHERE name = 'Package C';
UPDATE lesson_packages SET price = 180.00, original_price = 230.00 WHERE name = 'Road Test';
```

Run it:
```bash
docker exec -i driving_school_db psql -U postgres -d driving_school < update_prices.sql
```

#### Method 3: Admin API
```bash
# Login as admin
TOKEN=$(curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"yourpass"}' | jq -r '.data.accessToken')

# Update package
curl -X PUT http://localhost:5002/api/packages/PACKAGE_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"price": 90.00, "original_price": 120.00}'
```

### Verify Price Changes

```bash
# Check database
docker exec -i driving_school_db psql -U postgres -d driving_school -c \
  "SELECT name, price, original_price FROM lesson_packages ORDER BY price;"

# Check API
curl http://localhost:5002/api/packages | jq '.data[] | {name, price}'

# Visit frontend
open https://thetruthdrivingschool.ca/packages
```

### Important Notes

- ✅ Changes reflect **immediately** (no restart needed)
- ✅ Both frontend and payments update automatically
- ✅ Database is the single source of truth
- ⚠️ Always update both price and original_price

---

## 🌐 Tunnel Management

### Interactive Tunnel Manager

**Start the manager:**
```bash
cd /Users/alextruong/Documents/driving_school
./tunnel-manager.sh
```

### Menu Options

```
1) 🚀 Start Tunnel       - Start Cloudflare tunnel
2) 🛑 Stop Tunnel        - Stop running tunnel
3) 🔄 Restart Tunnel     - Restart tunnel
4) 🔍 Check Status       - View status
5) 📋 View Logs (Live)   - Watch live logs
6) 📄 View Last 50 Lines - Quick log view
7) ⚙️  Show Configuration - Display config
8) 🌐 Open Website       - Launch browser
0) 👋 Exit              - Close manager
```

### Quick Commands

**Start tunnel:**
```bash
./tunnel-manager.sh
# Press 1
```

**Check status:**
```bash
./tunnel-manager.sh
# Press 4
```

**View logs:**
```bash
./tunnel-manager.sh
# Press 6 (or 5 for live)
```

### Troubleshooting Tunnel

**Tunnel won't start:**
```bash
# Check cloudflared is installed
which cloudflared

# Install if needed
brew install cloudflared

# Check configuration
cat tunnel-config.yml

# View errors
tail -50 tunnel.log
```

**Website not accessible:**
```bash
# Check tunnel status
./tunnel-manager.sh # Press 4

# Restart tunnel
./tunnel-manager.sh # Press 3

# Wait for DNS (2-5 minutes)
```

---

## 📝 Quick Reference Commands

### Docker Operations

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart specific service
docker-compose restart backend

# View logs
docker-compose logs -f backend

# Check status
docker-compose ps
```

### Database Operations

```bash
# Connect to database
docker exec -it driving_school_db psql -U postgres -d driving_school

# View packages
docker exec -i driving_school_db psql -U postgres -d driving_school -c \
  "SELECT name, price FROM lesson_packages;"

# Backup database
docker exec -i driving_school_db pg_dump -U postgres driving_school > backup.sql

# Restore database
docker exec -i driving_school_db psql -U postgres -d driving_school < backup.sql
```

### Application Management

```bash
# Rebuild frontend
cd frontend && npm run build

# Clear Redis cache
docker-compose exec redis redis-cli FLUSHALL

# View backend logs
docker-compose logs backend --tail=100

# Check API health
curl http://localhost:5002/health
```

### Tunnel Commands

```bash
# Start tunnel
./tunnel-manager.sh # Press 1

# Stop tunnel
./tunnel-manager.sh # Press 2

# Check status
./tunnel-manager.sh # Press 4
```

### Price Management

```bash
# View current prices
docker exec -i driving_school_db psql -U postgres -d driving_school -c \
  "SELECT name, price, original_price FROM lesson_packages ORDER BY price;"

# Update single price
docker exec -i driving_school_db psql -U postgres -d driving_school -c \
  "UPDATE lesson_packages SET price = 90.00 WHERE name = '1 Hour Driving Lesson';"
```

---

## 🏠 Local Device Hosting

### Using Your Mac as Production Server

#### Prerequisites
- macOS with Docker Desktop
- Stable internet connection
- Cloudflare account
- Router with port forwarding capability (optional)

#### Setup Steps

1. **Install Required Software:**
   ```bash
   # Install Docker Desktop
   brew install --cask docker
   
   # Install cloudflared
   brew install cloudflared
   ```

2. **Configure Cloudflare Tunnel:**
   ```bash
   # Login
   cloudflared tunnel login
   
   # Create tunnel
   cloudflared tunnel create thetruthdrivingschool
   
   # Note the tunnel ID and credentials path
   ```

3. **Update tunnel-config.yml:**
   ```yaml
   tunnel: <YOUR_TUNNEL_ID>
   credentials-file: /Users/alextruong/.cloudflared/<TUNNEL_ID>.json
   
   ingress:
     - hostname: thetruthdrivingschool.ca
       service: http://localhost:80
     - service: http_status:404
   ```

4. **Configure DNS:**
   - Go to Cloudflare Dashboard
   - Add CNAME record: thetruthdrivingschool.ca → <TUNNEL_ID>.cfargotunnel.com

5. **Start Services:**
   ```bash
   # Start Docker services
   docker-compose up -d
   
   # Start tunnel
   ./tunnel-manager.sh # Press 1
   ```

#### Keep Mac Awake

```bash
# Prevent sleep while plugged in
sudo pmset -c sleep 0
sudo pmset -c displaysleep 10

# Create alias for quick toggle
alias keepawake="caffeinate -d"

# Use: keepawake & (runs in background)
```

#### Auto-Start on Boot

Create `~/Library/LaunchAgents/com.drivingschool.tunnel.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.drivingschool.tunnel</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Users/alextruong/Documents/driving_school/tunnel-manager.sh</string>
        <string>1</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```

Load it:
```bash
launchctl load ~/Library/LaunchAgents/com.drivingschool.tunnel.plist
```

#### Monitoring

```bash
# Check system resources
docker stats

# Monitor tunnel
./tunnel-manager.sh # Press 4

# Check logs
docker-compose logs -f
```

#### Advantages
- ✅ No hosting fees
- ✅ Full control
- ✅ Easy debugging
- ✅ Instant updates

#### Disadvantages
- ❌ Mac must stay on
- ❌ Dependent on home internet
- ❌ No professional uptime guarantee

---

## ❓ FAQ & Troubleshooting

### General Questions

**Q: How do I reset admin password?**
```bash
# Connect to database
docker exec -it driving_school_db psql -U postgres -d driving_school

# Update password (bcrypt hash for "NewPassword123")
UPDATE users SET password_hash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KqjKqK' WHERE email = 'admin@example.com';
```

**Q: How do I add a new admin user?**
```bash
# Via backend API
curl -X POST http://localhost:5002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newadmin@example.com",
    "password": "SecurePassword123",
    "firstName": "Admin",
    "lastName": "User",
    "phone": "1234567890"
  }'

# Then update user_type in database
docker exec -i driving_school_db psql -U postgres -d driving_school -c \
  "UPDATE users SET user_type = 'admin' WHERE email = 'newadmin@example.com';"
```

**Q: Website is slow, how to optimize?**
```bash
# Check resource usage
docker stats

# Optimize images in frontend/public/pictures/
# Use: imageoptim or similar tool

# Enable Redis caching (already configured)

# Check database indexes
docker exec -i driving_school_db psql -U postgres -d driving_school -c \
  "SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public';"
```

### Payment Issues

**Q: Payment successful but package not activated**
```bash
# Check UserPackage table
docker exec -i driving_school_db psql -U postgres -d driving_school -c \
  "SELECT * FROM user_packages WHERE user_id = 'USER_ID' ORDER BY created_at DESC LIMIT 5;"

# Check backend logs
docker-compose logs backend | grep -i "payment\|stripe" | tail -50

# Manually create package if needed
docker exec -i driving_school_db psql -U postgres -d driving_school -c \
  "INSERT INTO user_packages (user_id, package_id, package_name, total_lessons, lessons_remaining, purchase_price, payment_intent_id) 
   VALUES ('USER_ID', 'PACKAGE_ID', 'Package Name', 10, 10, 1000.00, 'pi_xxxxx');"
```

**Q: How to issue a refund?**
```bash
# Via Stripe Dashboard
# 1. https://dashboard.stripe.com/payments
# 2. Find payment
# 3. Click "Refund"
# 4. Confirm

# Update database
docker exec -i driving_school_db psql -U postgres -d driving_school -c \
  "UPDATE user_packages SET status = 'refunded' WHERE payment_intent_id = 'pi_xxxxx';"
```

### Database Issues

**Q: Database connection failed**
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres

# Verify connection
docker exec -i driving_school_db psql -U postgres -d driving_school -c "SELECT 1;"
```

**Q: How to backup database?**
```bash
# Full backup
docker exec -i driving_school_db pg_dump -U postgres driving_school > backup_$(date +%Y%m%d).sql

# Backup specific tables
docker exec -i driving_school_db pg_dump -U postgres -d driving_school -t user_packages > user_packages_backup.sql

# Restore
docker exec -i driving_school_db psql -U postgres -d driving_school < backup.sql
```

### Tunnel Issues

**Q: Tunnel keeps disconnecting**
```bash
# Check logs
tail -100 tunnel.log

# Restart tunnel
./tunnel-manager.sh # Press 3

# Check internet connection
ping 1.1.1.1

# Update cloudflared
brew upgrade cloudflared
```

**Q: Website shows 502 Bad Gateway**
```bash
# Check backend is running
docker-compose ps backend

# Check nginx configuration
docker-compose logs nginx

# Restart services
docker-compose restart backend nginx

# Check backend health
curl http://localhost:5002/health
```

### Email Issues

**Q: Emails not sending**
```bash
# Check email service logs
docker-compose logs backend | grep -i "email\|smtp"

# Verify SMTP settings in .env
cat .env | grep SMTP

# Test email manually
curl -X POST http://localhost:5002/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "test@example.com",
    "message": "Test message"
  }'
```

### Performance Issues

**Q: Application running slow**
```bash
# Check resource usage
docker stats

# Check for memory leaks
docker-compose logs backend | grep -i "memory\|heap"

# Restart services
docker-compose restart

# Clear Redis cache
docker-compose exec redis redis-cli FLUSHALL

# Optimize database
docker exec -i driving_school_db psql -U postgres -d driving_school -c "VACUUM ANALYZE;"
```

### Security Issues

**Q: Suspicious activity detected**
```bash
# Check security logs
docker-compose logs backend | grep -i "security\|brute\|suspicious"

# Check Redis brute force entries
docker-compose exec redis redis-cli KEYS "bruteforce:*"

# Block specific IP
# Add to security middleware or use firewall

# Review recent logins
docker exec -i driving_school_db psql -U postgres -d driving_school -c \
  "SELECT email, last_login, last_login_ip FROM users ORDER BY last_login DESC LIMIT 20;"
```

---

## 🔗 Additional Resources

### Documentation
- Main README: `/README.md`
- Security Guide: `/docs/Security.md`
- API Documentation: `/docs/api/README.md`

### External Links
- Stripe Dashboard: https://dashboard.stripe.com
- Cloudflare Dashboard: https://dash.cloudflare.com
- Docker Documentation: https://docs.docker.com
- Node.js: https://nodejs.org

### Support
- GitHub Issues: Your repository
- Email: Your support email
- Documentation: This guide

---

**Last Updated:** October 9, 2025  
**Version:** 2.0  
**Status:** Production Ready ✅

