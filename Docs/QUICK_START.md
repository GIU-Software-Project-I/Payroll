# Quick Start Guide - Payroll Backend

## ✅ Server Status

**Server is currently running!** 🎉

- **Base URL:** `http://localhost:8000`
- **Swagger API Docs:** `http://localhost:8000/api`
- **Payroll Configuration API:** `http://localhost:8000/payroll-configuration`

---

## 🚀 How to Start the Server

### Option 1: Development Mode (Recommended)
```bash
cd /Users/mano/Desktop/payroll-local-4/Payroll/backend
npm run start:dev
```

### Option 2: Using Nodemon (Auto-restart on changes)
```bash
cd /Users/mano/Desktop/payroll-local-4/Payroll/backend
npm run dev
```

### Option 3: Direct ts-node
```bash
cd /Users/mano/Desktop/payroll-local-4/Payroll/backend
npx ts-node --project tsconfig.json src/main.ts
```

---

## 📋 Prerequisites

### 1. Node.js and npm
- Node.js v18.0.0 or higher
- npm v9.0.0 or higher

### 2. MongoDB Atlas Connection
✅ Already configured in `.env` file:
```
MONGODB_URI=mongodb+srv://eyad:eyad2186@cluster0.o9vpa6w.mongodb.net/Software_gedeed?appName=Cluster0
```

### 3. Dependencies
✅ Already installed (`node_modules` exists)

---

## 🔧 Environment Configuration

The `.env` file is already created with:
- ✅ MongoDB Atlas connection string
- ✅ Server port (8000)
- ⚠️ Email configuration (placeholder - update if needed)
- ⚠️ JWT secret (placeholder - update for production)

---

## 🌐 Access Points

Once the server is running:

1. **Swagger API Documentation:**
   - URL: `http://localhost:8000/api`
   - Interactive API testing interface

2. **Payroll Configuration Endpoints:**
   - Base: `http://localhost:8000/payroll-configuration`
   - See `POSTMAN_TESTING_GUIDE.md` for all endpoints

3. **Health Check:**
   - Test: `curl http://localhost:8000/api`

---

## 🛑 How to Stop the Server

### If running in terminal:
Press `Ctrl + C`

### If running in background:
```bash
# Find the process
lsof -ti:8000

# Kill the process (replace PID with actual process ID)
kill <PID>

# Or kill all node processes (be careful!)
pkill -f "ts-node.*main.ts"
```

---

## 🐛 Troubleshooting

### Issue: Port 8000 already in use
```bash
# Find what's using port 8000
lsof -ti:8000

# Kill it
kill $(lsof -ti:8000)

# Or change PORT in .env file
```

### Issue: MongoDB connection error
- Check MongoDB Atlas network access (whitelist your IP)
- Verify connection string in `.env` file
- Check database name exists: `Software_gedeed`

### Issue: Module not found errors
```bash
# Reinstall dependencies
cd /Users/mano/Desktop/payroll-local-4/Payroll/backend
rm -rf node_modules package-lock.json
npm install
```

### Issue: Email authentication error
- This is expected if using placeholder email credentials
- Server will still run, but email features won't work
- Update `.env` with real email credentials if needed

---

## 📚 Next Steps

1. **Test the API:**
   - Open Swagger: `http://localhost:8000/api`
   - Use Postman with `POSTMAN_TESTING_GUIDE.md`

2. **Test Payroll Configuration:**
   - See `POSTMAN_TESTING_GUIDE.md` for all endpoints
   - Test Phase 3, 4, and 5 endpoints

3. **Check Logs:**
   - Server logs appear in the terminal
   - Watch for MongoDB connection messages

---

## ✅ Verification

To verify the server is running:

```bash
# Check if port 8000 is listening
lsof -ti:8000

# Test Swagger endpoint
curl http://localhost:8000/api

# Test payroll configuration endpoint (should return error if no auth, but confirms server is up)
curl http://localhost:8000/payroll-configuration/company-settings
```

---

## 📝 Available Scripts

- `npm run start:dev` - Start development server
- `npm run dev` - Start with nodemon (auto-restart)
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start with nodemon
- `npm run watch` - Watch mode for TypeScript compilation

---

**Last Updated:** 2024  
**Status:** ✅ Server Running Successfully

