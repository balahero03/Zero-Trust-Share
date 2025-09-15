# Database Structure Explanation: Zero-Trust-Share

## Overview
Your Zero-Trust-Share application uses a **hybrid storage architecture** that separates metadata from file data for maximum security and privacy.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    ZERO-TRUST-SHARE ARCHITECTURE                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐ │
│  │   SUPABASE      │    │   AWS S3        │    │   CLIENT     │ │
│  │   (PostgreSQL)  │    │   (File Storage)│    │   (Browser)  │ │
│  │                 │    │                 │    │              │ │
│  │ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌──────────┐ │ │
│  │ │ shared_files│ │    │ │ Encrypted   │ │    │ │ Master   │ │ │
│  │ │ table       │ │    │ │ File Data   │ │    │ │ Key      │ │ │
│  │ │             │ │    │ │             │ │    │ │ (PBKDF2) │ │ │
│  │ │ • Metadata  │ │    │ │ • Binary    │ │    │ │          │ │ │
│  │ │ • References│ │    │ │ • AES-256   │ │    │ │ File Key │ │ │
│  │ │ • Access    │ │    │ │ • GCM Mode  │ │    │ │ (PBKDF2) │ │ │
│  │ │   Control   │ │    │ │             │ │    │ │          │ │ │
│  │ └─────────────┘ │    │ └─────────────┘ │    │ └──────────┘ │ │
│  └─────────────────┘    └─────────────────┘    └──────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 1. SUPABASE DATABASE (PostgreSQL)

### Table: `shared_files`

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `id` | UUID | Unique file identifier | `550e8400-e29b-41d4-a716-446655440000` |
| `owner_id` | UUID | User who uploaded the file | `123e4567-e89b-12d3-a456-426614174000` |
| `s3_key` | TEXT | AWS S3 object key/path | `user123/550e8400-e29b-41d4-a716-446655440000` |
| `encrypted_file_name` | TEXT | **Encrypted** filename (AES-256-GCM) | `U2FsdGVkX1+vupppZksvRf5pq5g5XjFRlipRkwB0K1Y=` |
| `file_size` | BIGINT | Original file size in bytes | `1048576` (1MB) |
| `file_salt` | TEXT | Random salt for file key derivation | `[32, 45, 67, 89, ...]` (32 bytes) |
| `expires_at` | TIMESTAMP | When file expires (optional) | `2024-12-31 23:59:59+00` |
| `burn_after_read` | BOOLEAN | Delete after first download | `true` |
| `download_count` | INTEGER | Number of times downloaded | `0` |
| `created_at` | TIMESTAMP | When file was uploaded | `2024-01-15 10:30:00+00` |

### Security Features:
- **Row Level Security (RLS)** enabled
- Users can only access their own files
- Anonymous users can read file metadata (for recipients)
- Automatic cleanup of expired files

## 2. AWS S3 STORAGE

### File Structure:
```
your-bucket-name/
├── user123/
│   ├── 550e8400-e29b-41d4-a716-446655440000
│   ├── 6ba7b810-9dad-11d1-80b4-00c04fd430c8
│   └── 6ba7b811-9dad-11d1-80b4-00c04fd430c8
├── user456/
│   ├── 550e8400-e29b-41d4-a716-446655440001
│   └── 550e8400-e29b-41d4-a716-446655440002
└── user789/
    └── 550e8400-e29b-41d4-a716-446655440003
```

### What's Stored in S3:
- **Encrypted file data** (AES-256-GCM)
- **Binary format** (application/octet-stream)
- **No metadata** (filename, size, etc. stored in Supabase)
- **Organized by user ID** for access control

## 3. ENCRYPTION LAYERS

### Layer 1: File Encryption (Client-Side)
```javascript
// File is encrypted with user-provided passcode
const fileKey = await deriveFileKey(passcode, fileSalt);
const encryptedData = await crypto.subtle.encrypt(
  { name: "AES-GCM", iv },
  fileKey,
  fileBuffer
);
```

### Layer 2: Metadata Encryption (Client-Side)
```javascript
// Filename is encrypted with master key
const masterKey = await deriveMasterKey(password, salt);
const encryptedFileName = await encryptMetadata(filename, masterKey);
```

### Layer 3: Transport Security
- HTTPS for all communications
- Pre-signed URLs for direct S3 access
- JWT tokens for authentication

## 4. DATA FLOW

### Upload Process:
1. **User selects file** → Client-side
2. **User enters passcode** → Client-side
3. **File encrypted** with passcode → Client-side
4. **Filename encrypted** with master key → Client-side
5. **Metadata sent** to Supabase → Server
6. **Pre-signed URL** generated → AWS S3
7. **Encrypted file** uploaded directly to S3 → AWS S3

### Download Process:
1. **User clicks share link** → Client-side
2. **File metadata** retrieved from Supabase → Server
3. **Pre-signed URL** generated → AWS S3
4. **Encrypted file** downloaded from S3 → AWS S3
5. **User enters passcode** → Client-side
6. **File decrypted** with passcode → Client-side

## 5. ZERO-KNOWLEDGE ARCHITECTURE

### What the Server NEVER Sees:
- ❌ Original file content
- ❌ User passwords
- ❌ File passcodes
- ❌ Original filenames
- ❌ Master keys
- ❌ File keys

### What the Server DOES See:
- ✅ Encrypted file data (meaningless without keys)
- ✅ Encrypted filenames (meaningless without keys)
- ✅ File sizes
- ✅ Upload/download timestamps
- ✅ User IDs
- ✅ Access patterns

## 6. SECURITY BENEFITS

### Privacy:
- **End-to-end encryption** - only you can decrypt your files
- **Zero-knowledge** - server cannot read your data
- **Metadata protection** - even filenames are encrypted

### Access Control:
- **User isolation** - users can only access their own files
- **Time-based expiration** - files automatically expire
- **Burn-after-read** - files can be deleted after first download
- **Download tracking** - monitor file access

### Data Integrity:
- **AES-256-GCM** - authenticated encryption
- **PBKDF2** - secure key derivation
- **Random salts** - prevent rainbow table attacks
- **Fresh IVs** - prevent replay attacks

## 7. STORAGE COSTS

### Supabase (Free Tier):
- **500MB** database storage
- **50,000** monthly active users
- **2GB** bandwidth

### Azure Blob Storage (Free Tier):
- **5GB** storage
- **20,000** transactions
- **5GB** data transfer out
- **12 months** free

## 8. EXAMPLE DATA

### Supabase Record:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "owner_id": "123e4567-e89b-12d3-a456-426614174000",
  "s3_key": "123e4567-e89b-12d3-a456-426614174000/550e8400-e29b-41d4-a716-446655440000",
  "encrypted_file_name": "U2FsdGVkX1+vupppZksvRf5pq5g5XjFRlipRkwB0K1Y=",
  "file_size": 1048576,
  "file_salt": "[32, 45, 67, 89, 12, 34, 56, 78, ...]",
  "expires_at": "2024-12-31T23:59:59Z",
  "burn_after_read": true,
  "download_count": 0,
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Azure Blob Object:
- **Blob Name**: `123e4567-e89b-12d3-a456-426614174000/550e8400-e29b-41d4-a716-446655440000`
- **Content**: Binary encrypted data (AES-256-GCM)
- **Size**: ~1MB (encrypted)
- **Content-Type**: `application/octet-stream`

## 9. BACKUP AND RECOVERY

### Data Backup:
- **Supabase**: Automatic daily backups
- **AWS S3**: 99.999999999% durability
- **Cross-region replication** available

### Recovery Process:
1. **Database recovery** from Supabase backups
2. **File recovery** from S3 (if not expired)
3. **User re-authentication** required
4. **Key derivation** from user passwords

## 10. MONITORING AND LOGS

### What's Logged:
- File upload/download events
- Authentication attempts
- API usage
- Error rates
- Performance metrics

### What's NOT Logged:
- File contents
- User passwords
- Decryption keys
- Original filenames

---

This architecture ensures that your files are completely private and secure, with the server acting only as a secure storage and routing service without any ability to access your actual data.
