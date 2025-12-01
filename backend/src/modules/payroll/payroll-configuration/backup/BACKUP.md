# Backup Folder - Architecture & Integration Guide

## 📋 Overview

The `backup/` folder contains a **MongoDB backup system** that creates backups of payroll configuration data. This system implements **REQ-PY-16: System Backup Configuration**, allowing System Admins to back up payroll configuration & tables regularly to prevent data loss.

This document explains:
- How the backup system works
- Backup folder structure
- Integration with payroll-configuration module
- Backup workflow and processes
- Configuration and usage

---

## 🏗️ Architecture Overview

### Folder Structure

```
backup/
├── Backup-Service.ts      # Core backup service (mongodump wrapper)
├── Backup-Controller.ts   # REST API endpoints (standalone)
└── Backup-Module.ts      # NestJS module definition
```

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│         Payroll Configuration Module                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  PayrollConfigurationController                      │  │
│  │  - POST /backup/create                               │  │
│  │  - GET /backup/list                                  │  │
│  │  - DELETE /backup/:filename                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                   │
│                          │ calls                             │
│                          ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  PayrollConfigurationService                          │  │
│  │  - createBackup()                                     │  │
│  │  - listBackups()                                      │  │
│  │  - deleteBackup()                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ dynamically imports
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backup Folder                             │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ Backup-Service   │  │ Backup-Controller│                │
│  │ (Core Logic)     │  │ (Standalone API) │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ executes
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              MongoDB Tools (mongodump)                      │
│  - Creates BSON dumps                                       │
│  - Converts to JSON                                         │
│  - Generates manifest                                       │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ saves to
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              File System (./backups/)                       │
│  backup_name_2024-01-15_10-30-00/                          │
│  ├── database_name/                                         │
│  │   ├── collection1.json                                  │
│  │   ├── collection2.json                                  │
│  │   └── ...                                               │
│  └── manifest.json                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 File Breakdown

### 1. **Backup-Service.ts** - Core Backup Logic

**Purpose:** Handles all backup operations using MongoDB's `mongodump` tool

**Key Features:**
- Executes `mongodump` command to create database backups
- Converts BSON files to JSON format for readability
- Cleans up temporary BSON files
- Generates backup manifests with metadata
- Manages backup retention (keeps N most recent backups)
- Calculates backup sizes and collection statistics

**Main Methods:**

```typescript
// Create a new backup
async createBackup(options: BackupOptions): Promise<BackupMetadata>

// List all existing backups
async listBackups(): Promise<BackupMetadata[]>

// Delete a specific backup
async deleteBackup(filename: string): Promise<void>

// Clean up old backups (automatic)
async cleanupOldBackups(): Promise<void>
```

**Configuration:**
- `BACKUP_DIR`: Backup storage directory (default: `./backups`)
- `MONGODB_URI`: MongoDB connection string
- `BACKUP_MAX_COUNT`: Maximum number of backups to keep (default: 10)

---

### 2. **Backup-Controller.ts** - Standalone REST API

**Purpose:** Provides REST endpoints for backup operations (originally designed as standalone)

**Endpoints:**
- `POST /api/backups/create` - Create a new backup
- `GET /api/backups/list` - List all backups
- `DELETE /api/backups/:filename` - Delete a backup

**Security:**
- Protected by `JwtAuthGuard` (requires authentication)
- Protected by `RolesGuard` (requires ADMIN role)

**Note:** This controller is **not currently used** in the payroll-configuration module. Instead, backup functionality is accessed through the payroll-configuration controller.

---

### 3. **Backup-Module.ts** - NestJS Module

**Purpose:** Defines the backup module with dependencies

**Dependencies:**
- `ScheduleModule` - For scheduled backups (cron jobs)
- `AuditLogModule` - For audit logging (optional)
- `AuthModule` - For authentication/authorization

**Exports:**
- `BackupService` - Exported for use in other modules

---

## 🔄 How Backup Works

### Backup Process Flow

```
1. User Request
   POST /payroll-configuration/backup/create
   { "name": "payroll-config-backup", "oplog": false }

2. PayrollConfigurationController
   → Receives request
   → Calls payrollConfigurationService.createBackup()

3. PayrollConfigurationService
   → Dynamically imports BackupService
   → Creates BackupService instance
   → Calls backupService.createBackup()

4. BackupService.createBackup()
   ├─ Step 1: Generate backup filename with timestamp
   │   Example: "payroll-config-backup_2024-01-15_10-30-00"
   │
   ├─ Step 2: Execute mongodump command
   │   Command: mongodump --uri="..." --out="./backups/backup_name_..."
   │   Result: Creates BSON files in backup directory
   │
   ├─ Step 3: Convert BSON to JSON
   │   - Uses bsondump tool
   │   - Converts each .bson file to .json
   │   - Makes backups human-readable
   │
   ├─ Step 4: Clean up BSON files
   │   - Deletes .bson files (saves space)
   │   - Deletes .metadata.json files
   │   - Keeps only .json files
   │
   ├─ Step 5: Generate manifest
   │   - Creates manifest.json with:
   │     * Backup metadata (timestamp, size, path)
   │     * Collection list with document counts
   │     * Backup options used
   │
   ├─ Step 6: Clean up old backups
   │   - Keeps only N most recent backups (default: 10)
   │   - Deletes older backups automatically
   │
   └─ Step 7: Return metadata
       → Returns BackupMetadata object
```

### Backup Directory Structure

After a backup is created, the directory structure looks like:

```
./backups/
└── payroll-config-backup_2024-01-15_10-30-00/
    ├── database_name/                    # Database folder
    │   ├── allowances.json               # Collection backup (JSON)
    │   ├── paygrades.json
    │   ├── taxrules.json
    │   ├── insurancebrackets.json
    │   └── ... (other collections)
    └── manifest.json                     # Backup metadata
```

**manifest.json Example:**
```json
{
  "filename": "payroll-config-backup_2024-01-15_10-30-00",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "size": 5242880,
  "path": "./backups/payroll-config-backup_2024-01-15_10-30-00",
  "options": {
    "name": "payroll-config-backup",
    "oplog": false,
    "dumpDbUsersAndRoles": false
  },
  "totalCollections": 9,
  "collections": [
    {
      "name": "allowances",
      "documents": 15,
      "size": 102400,
      "file": "./database_name/allowances.json"
    },
    // ... more collections
  ]
}
```

---

## 🔌 Integration with Payroll Configuration

### Current Integration Approach

The backup service is **dynamically imported** in the payroll-configuration service to avoid circular dependencies:

**In `payroll-configuration.service.ts`:**

```typescript
async createBackup(options: {
  name?: string;
  oplog?: boolean;
  dumpDbUsersAndRoles?: boolean;
} = {}): Promise<any> {
  // Dynamic import to avoid circular dependencies
  const { BackupService } = await import('./backup/Backup-Service');
  const backupService = new BackupService(null as any); // Audit service is optional

  try {
    return await backupService.createBackup({
      name: options.name || 'payroll-config-backup',
      oplog: options.oplog ?? false,
      dumpDbUsersAndRoles: options.dumpDbUsersAndRoles ?? false,
    });
  } catch (error) {
    throw new BadRequestException(
      `Backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
```

**Why Dynamic Import?**
- Avoids circular dependency issues
- Allows backup service to be optional
- Doesn't require BackupModule to be imported in PayrollConfigurationModule

### API Endpoints

Backup functionality is exposed through the payroll-configuration controller:

**1. Create Backup**
```http
POST /payroll-configuration/backup/create
Content-Type: application/json

{
  "name": "payroll-config-backup",
  "oplog": false,
  "dumpDbUsersAndRoles": false
}
```

**Response:**
```json
{
  "filename": "payroll-config-backup_2024-01-15_10-30-00",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "size": 5242880,
  "path": "./backups/payroll-config-backup_2024-01-15_10-30-00",
  "options": { ... },
  "collections": [ ... ]
}
```

**2. List Backups**
```http
GET /payroll-configuration/backup/list
```

**Response:**
```json
[
  {
    "filename": "payroll-config-backup_2024-01-15_10-30-00",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "size": 5242880,
    "path": "./backups/payroll-config-backup_2024-01-15_10-30-00"
  },
  // ... more backups
]
```

**3. Delete Backup**
```http
DELETE /payroll-configuration/backup/payroll-config-backup_2024-01-15_10-30-00
```

**Response:**
```json
{
  "message": "Backup deleted successfully"
}
```

---

## ⚙️ Configuration

### Environment Variables

The backup service uses the following environment variables:

```bash
# Backup directory (default: ./backups)
BACKUP_DIR=./backups

# MongoDB connection URI
MONGODB_URI=mongodb://localhost:27017/payroll-db

# Maximum number of backups to keep (default: 10)
BACKUP_MAX_COUNT=10
```

### Backup Options

When creating a backup, you can specify options:

```typescript
interface BackupOptions {
  name?: string;              // Backup name prefix (default: "backup")
  oplog?: boolean;            // Include oplog (for replica sets)
  dumpDbUsersAndRoles?: boolean; // Include users and roles
}
```

**Option Details:**

1. **`name`**: Custom name for the backup
   - Example: `"payroll-config-backup"` → `"payroll-config-backup_2024-01-15_10-30-00"`
   - Default: `"backup"`

2. **`oplog`**: Include MongoDB oplog
   - Useful for replica sets
   - Captures ongoing operations
   - Default: `false`

3. **`dumpDbUsersAndRoles`**: Include database users and roles
   - Backs up authentication data
   - Useful for full database restoration
   - Default: `false`

---

## 🔧 Technical Details

### MongoDB Tools Used

**1. mongodump**
- MongoDB's native backup tool
- Creates BSON dumps of collections
- Command: `mongodump --uri="..." --out="..."`
- Options:
  - `--oplog`: Include oplog
  - `--dumpDbUsersAndRoles`: Include users/roles

**2. bsondump**
- Converts BSON files to JSON
- Makes backups human-readable
- Command: `bsondump "file.bson"`

### Backup File Format

**Before Conversion (BSON):**
```
backup_name/
└── database_name/
    ├── collection1.bson          # Binary format
    ├── collection1.metadata.json
    ├── collection2.bson
    └── collection2.metadata.json
```

**After Conversion (JSON):**
```
backup_name/
└── database_name/
    ├── collection1.json          # Human-readable JSON
    └── collection2.json
```

**JSON File Structure:**
```json
{
  "collection": "allowances",
  "documents": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Transportation Allowance",
      "amount": 500,
      "status": "approved",
      "createdAt": "2024-01-15T10:00:00.000Z"
    },
    // ... more documents
  ]
}
```

### Backup Retention

The service automatically manages backup retention:

1. **After each backup creation:**
   - Lists all backups
   - Sorts by timestamp (newest first)
   - Keeps only `BACKUP_MAX_COUNT` most recent backups
   - Deletes older backups

2. **Example:**
   - `BACKUP_MAX_COUNT = 10`
   - If 15 backups exist, keeps newest 10, deletes oldest 5

### Error Handling

The backup service includes comprehensive error handling:

1. **Backup Creation Failures:**
   - Logs error details
   - Throws exception with descriptive message
   - Optionally logs to audit service

2. **File System Errors:**
   - Handles missing directories
   - Handles permission errors
   - Continues with other operations if one fails

3. **MongoDB Connection Errors:**
   - Validates connection string
   - Provides clear error messages
   - Doesn't crash the application

---

## 🚀 Usage Examples

### Example 1: Create a Simple Backup

```typescript
// Via API
POST /payroll-configuration/backup/create
{}

// Creates: "backup_2024-01-15_10-30-00"
```

### Example 2: Create Named Backup

```typescript
// Via API
POST /payroll-configuration/backup/create
{
  "name": "pre-deployment-backup"
}

// Creates: "pre-deployment-backup_2024-01-15_10-30-00"
```

### Example 3: Create Full Backup with Oplog

```typescript
// Via API
POST /payroll-configuration/backup/create
{
  "name": "full-backup",
  "oplog": true,
  "dumpDbUsersAndRoles": true
}

// Creates comprehensive backup with oplog and users/roles
```

### Example 4: List All Backups

```typescript
// Via API
GET /payroll-configuration/backup/list

// Returns array of all backups sorted by date (newest first)
```

### Example 5: Delete Old Backup

```typescript
// Via API
DELETE /payroll-configuration/backup/backup_2024-01-10_08-00-00

// Deletes the specified backup directory
```

---

## 🔐 Security Considerations

### Current Implementation

1. **No Authentication in Payroll Endpoints:**
   - Backup endpoints in `PayrollConfigurationController` are **not protected**
   - Should add authentication/authorization guards

2. **Standalone Controller (Unused):**
   - `Backup-Controller.ts` has authentication (`JwtAuthGuard`, `RolesGuard`)
   - Requires ADMIN role
   - Not currently used

### Recommended Security

**Add to `PayrollConfigurationController`:**

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { Roles } from '../authentication/decorators/roles.decorator';

@Controller('payroll-configuration')
export class PayrollConfigurationController {
  @Post('backup/create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  createBackup(@Body() body?: BackupOptions) {
    // ...
  }
}
```

---

## 📊 Backup Metadata

Each backup includes comprehensive metadata:

```typescript
interface BackupMetadata {
  filename: string;                    // Backup directory name
  timestamp: Date;                     // When backup was created
  size: number;                        // Total size in bytes
  path: string;                        // Full path to backup
  options?: BackupOptions;             // Options used
  collections?: Array<{                // Collection details
    name: string;                      // Collection name
    documents: number;                 // Document count
    file: string;                      // File path
    size: number;                       // File size
  }>;
}
```

---

## 🔄 Scheduled Backups

The backup module includes support for scheduled backups via `CronBackupService`:

**Note:** The cron service is referenced in `Backup-Module.ts` but implementation details are in a separate scheduler module.

**Example Cron Configuration:**
```typescript
// Daily backup at 2 AM
@Cron('0 2 * * *')
async scheduledBackup() {
  await this.backupService.createBackup({
    name: 'scheduled-daily-backup',
  });
}
```

---

## 🐛 Troubleshooting

### Common Issues

**1. mongodump not found**
```
Error: mongodump: command not found
```
**Solution:** Install MongoDB Database Tools
```bash
# macOS
brew install mongodb-database-tools

# Linux
apt-get install mongodb-database-tools

# Or download from MongoDB website
```

**2. Permission Denied**
```
Error: EACCES: permission denied, mkdir './backups'
```
**Solution:** Ensure backup directory has write permissions
```bash
chmod 755 ./backups
```

**3. MongoDB Connection Failed**
```
Error: Failed to connect to MongoDB
```
**Solution:** Check `MONGODB_URI` environment variable
```bash
# Verify connection string
echo $MONGODB_URI
```

**4. Backup Directory Full**
```
Error: ENOSPC: no space left on device
```
**Solution:** 
- Clean up old backups
- Increase disk space
- Change backup directory to different drive

---

## 📝 Best Practices

### 1. **Regular Backups**
- Schedule daily backups
- Keep at least 7-30 days of backups
- Test restore procedures regularly

### 2. **Backup Storage**
- Store backups on separate storage
- Consider cloud storage for off-site backups
- Encrypt sensitive backup data

### 3. **Monitoring**
- Monitor backup success/failure
- Alert on backup failures
- Track backup sizes over time

### 4. **Testing**
- Regularly test backup restoration
- Verify backup integrity
- Document restore procedures

### 5. **Documentation**
- Document backup schedule
- Document restore procedures
- Keep backup location inventory

---

## 🔮 Future Enhancements

### Potential Improvements

1. **Incremental Backups**
   - Only backup changed data
   - Reduce backup time and size

2. **Cloud Storage Integration**
   - Upload backups to S3, Azure Blob, etc.
   - Automatic off-site backups

3. **Backup Encryption**
   - Encrypt backups at rest
   - Secure sensitive payroll data

4. **Backup Verification**
   - Verify backup integrity
   - Test restore automatically

5. **Backup Compression**
   - Compress backups to save space
   - Faster transfer times

6. **Backup Restoration API**
   - REST endpoint to restore from backup
   - Automated disaster recovery

---

## 📚 Related Documentation

- `MOCKS_INTEGRATION_GUIDE.md` - Mock services integration
- `REQUIREMENTS_ANALYSIS.md` - Requirements implementation status
- MongoDB Backup Documentation: https://docs.mongodb.com/manual/backup/

---

## ✅ Summary

The backup folder provides:

1. **Complete Backup Solution**: Full MongoDB backup functionality
2. **JSON Format**: Human-readable backup files
3. **Automatic Cleanup**: Manages backup retention
4. **Metadata Tracking**: Comprehensive backup information
5. **Flexible Integration**: Dynamic import avoids circular dependencies
6. **API Endpoints**: RESTful backup management

**Key Takeaway:** The backup system is fully functional and integrated into the payroll-configuration module via dynamic imports. It provides comprehensive backup capabilities while maintaining flexibility and avoiding tight coupling.

---
