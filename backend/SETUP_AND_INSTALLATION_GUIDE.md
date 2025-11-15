# Recruitment System - Setup & Installation Guide

## Prerequisites

- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (v9.0.0 or higher) - Comes with Node.js
- **Git** (for version control) - [Download](https://git-scm.com/)

---

## Tech Stack
- **Backend Framework**: NestJS 11.x
- **Frontend Framework**: Next.js (deployed to cloud)
- **Language**: TypeScript 5.3
- **Database**: MongoDB 6.x with Mongoose 8.x
- **Authentication**: JWT + Passport
- **API Docs**: Swagger/OpenAPI

---

## Installation Steps

### Step 1: Clone Repository

```bash
git clone <repository-url>
```

### Step 2: Navigate to Project

```bash
cd Recruitment
```

### Step 3: Navigate to Backend

```bash
cd backend
```

### Step 4: Install Dependencies

```bash
npm install
```

### Step 5: Create Environment File

Create a `.env` file in the backend directory with the configuration below.

---

## Environment Configuration (.env File)

Create a `.env` file in the `backend` directory:

```env
# NEVER PUSH THE .env FILE

## Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/software_project_1?appName=Cluster0

## Server Configuration
PORT=8000
NODE_ENV=development

## Authentication Configuration
JWT_SECRET=your-super-secret-key-min-32-characters-long
JWT_EXPIRES_IN=7d

## Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
FEEDBACK_TO_EMAIL=your-email@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false

## Audit Log Configuration
AUDIT_TTL_DAYS=180

## Backup Configuration
BACKUP_DIR=./backups
BACKUP_MAX_COUNT=10
BACKUP_ENABLE_TEST=false
BACKUP_CRON_TEST=*/1 * * * *
BACKUP_CRON_PROD=0 2 * * *
BACKUP_TIMEZONE=Africa/Cairo
BACKUP_USE_OPLOG=false
BACKUP_DUMP_USERS=false
BACKUP_NAME_PREFIX=scheduled
```

### Environment Variable Explanation

| Variable | Purpose | Example |
|----------|---------|---------|
| `MONGODB_URI` | Database connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `PORT` | Server port | `8000` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `JWT_SECRET` | JWT signing key | `my-secret-key` |
| `JWT_EXPIRES_IN` | Token expiration time | `7d` (7 days) |
| `EMAIL_USER` | Gmail account | `your-email@gmail.com` |
| `EMAIL_APP_PASSWORD` | Gmail app password | `xxxx xxxx xxxx xxxx` |
| `FEEDBACK_TO_EMAIL` | Feedback recipient | `your-email@gmail.com` |
| `SMTP_HOST` | SMTP server | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_SECURE` | Use SSL/TLS | `false` |
| `AUDIT_TTL_DAYS` | Audit log retention | `180` |
| `BACKUP_DIR` | Backup directory path | `./backups` |
| `BACKUP_MAX_COUNT` | Maximum backup files | `10` |
| `BACKUP_ENABLE_TEST` | Enable test mode | `false` |
| `BACKUP_CRON_TEST` | Test backup schedule | `*/1 * * * *` |
| `BACKUP_CRON_PROD` | Production backup schedule | `0 2 * * *` (2 AM daily) |
| `BACKUP_TIMEZONE` | Timezone for backups | `Africa/Cairo` |
| `BACKUP_USE_OPLOG` | Use MongoDB oplog | `false` |
| `BACKUP_DUMP_USERS` | Include user data | `false` |
| `BACKUP_NAME_PREFIX` | Backup file prefix | `scheduled` |

---

## Running the Application

### Option 1: Development Mode with Auto-Reload

```bash
npm run dev
```

### Option 2: Development Mode (One-time Run)

```bash
npm run start:dev
```

### Option 3: Build and Run (Production-like)

```bash
npm run build
node dist/main.js
```

**Expected Output**:
```
[Nest] 12345  - 11/14/2025, 10:30:45 AM     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 11/14/2025, 10:30:46 AM     LOG [InstanceLoader] AppModule dependencies initialized
Application running on http://localhost:8000
Swagger running on http://localhost:8000/api
```

### Verify Application is Running

Open your browser and navigate to:

```
http://localhost:8000/api
```

You should see the Swagger API documentation interface.

---

## API Documentation

Once the application is running, access the interactive API documentation:

### Swagger UI
- **URL**: `http://localhost:8000/api`
- **Features**:
  - View all available endpoints
  - Test API calls directly from the browser
  - See request/response schemas
  - Auto-generated from code decorators


---

## Troubleshooting

### Issue: Port 8000 Already in Use

```bash
# Check what's using the port (Windows)
netstat -ano | findstr :8000

# Kill the process using the port
taskkill /PID <PID> /F

# Or use a different port
# Update PORT in .env file
```

### Issue: MongoDB Connection Failed

```
Error: connect ECONNREFUSED
```

**Solutions**:
1. Verify MongoDB URI in `.env` is correct
2. Check username and password don't have special characters (or URL-encode them)
3. Add your IP to MongoDB Atlas Network Access
4. Ensure internet connection is stable
5. Test connection manually:

```bash
# Using MongoDB connection string
mongosh "mongodb+srv://username:password@cluster.mongodb.net/database"
```

### Issue: Gmail SMTP Authentication Failed

```
Error: Invalid login: 535-5.7.8 Username and password not accepted
```

**Solutions**:
1. Verify you're using App Password (not regular Gmail password)
2. Remove spaces from App Password if needed
3. Ensure 2-Step Verification is enabled on Gmail account
4. Generate a new App Password

### Issue: Dependencies Not Installing

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rmdir /s /q node_modules
del package-lock.json

# Reinstall
npm install
```

### Issue: TypeScript Compilation Errors

```bash
# Clear build directory
rmdir /s /q dist

# Rebuild
npm run build
```

### Issue: Module Not Found

```
Cannot find module '@nestjs/core'
```

**Solution**:
```bash
# Reinstall dependencies
npm install

# Or install specific package
npm install @nestjs/core@latest
```

### Issue: Environment Variables Not Loading

```bash
# Verify .env file exists in backend directory
dir .env

# Check .env file path is correct (should be at backend root)
# The file should be at: D:\WebstormProjects\SubSystem 3\Recruitment\backend\.env

# Make sure NODE_ENV is set correctly
set NODE_ENV=development
npm run dev
```

---

## Project Structure

```
Recruitment/
├── backend/
│   ├── src/
│   │   ├── main.ts                 # Application entry point
│   │   ├── app.module.ts           # Root module
│   │   ├── controllers/            # HTTP request handlers
│   │   ├── services/               # Business logic
│   │   ├── models/                 # Database schemas
│   │   ├── dto/                    # Data transfer objects
│   │   └── modules/                # Feature modules
│   ├── dist/                       # Compiled JavaScript (generated)
│   ├── node_modules/               # Dependencies (generated)
│   ├── .env                        # Environment variables (KEEP SECRET)
│   ├── .env.example                # Example environment template
│   ├── .gitignore                  # Git ignore rules
│   ├── .prettierrc                 # Code formatting rules
│   ├── eslint.config.mjs           # Linting rules
│   ├── nest-cli.json               # NestJS CLI configuration
│   ├── package.json                # Dependencies and scripts
│   ├── package-lock.json           # Locked dependency versions
│   ├── tsconfig.json               # TypeScript configuration
│   ├── tsconfig.build.json         # TypeScript build configuration
│   └── README.md                   # Project documentation
├── SETUP_AND_INSTALLATION_GUIDE.md # This file
└── README.md                       # Main project documentation
```

### Key Files Explained

| File | Purpose |
|------|---------|
| `main.ts` | Application bootstrap, server configuration, Swagger setup |
| `app.module.ts` | Root module, imports all feature modules |
| `package.json` | Project metadata, dependencies, and npm scripts |
| `.env` | Secret credentials and configuration (never commit) |
| `tsconfig.json` | TypeScript compiler configuration |
| `eslint.config.mjs` | Code style and quality rules |

---

## Additional Resources

- **NestJS Documentation**: https://docs.nestjs.com/
- **MongoDB Documentation**: https://docs.mongodb.com/
- **TypeScript Documentation**: https://www.typescriptlang.org/docs/
- **JWT Introduction**: https://jwt.io/introduction
- **Swagger/OpenAPI**: https://swagger.io/

---


## License & Credits

This project is part of the Human Resources Management System.

For more information or support, contact the development team.

---

**Last Updated**: November 14, 2025
**Version**: 1.0.0

