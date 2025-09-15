# AetherVault - Zero-Knowledge File Sharing Platform

AetherVault is the first platform to apply a full-stack, zero-knowledge architecture, encrypting not only your shared files but also your account metadata, ensuring absolute privacy even in the event of a full server-side breach.

## 🏆 The Winning Vision

**"AetherVault is the first platform to apply a full-stack, zero-knowledge architecture, encrypting not only your shared files but also your account metadata, ensuring absolute privacy even in the event of a full server-side breach."**

## 🔐 Zero-Knowledge Architecture

### The Triangle of Trustless Exchange

| Feature | Google Drive | WeTransfer | Firefox Send | AetherVault |
|---------|-------------|------------|--------------|-------------|
| **Uncompromising Privacy** | ❌ Server-Side Encryption | ❌ Server-Side Encryption | ✅ Client-Side E2EE | ✅ **Full-Stack Zero-Knowledge** |
| **Verifiable Delivery** | ❌ Insecure Password Model | ❌ Insecure Password Model | ❌ No delivery verification | ✅ **The Digital Handshake** |
| **Accountable Control** | ❌ Limited Policy Control | ❌ No User Control | ❌ Anonymous model led to abuse | ✅ **Auth-gated with superior security** |

### Key Features

- **Zero-Knowledge Encryption**: All encryption happens client-side using Web Crypto API
- **PBKDF2 Key Derivation**: 100,000 iterations for strong key derivation
- **Metadata Protection**: Even file names are encrypted with user's master key
- **Burn After Read**: Files can be automatically deleted after first download
- **Expiry Controls**: Set custom expiration times for shared files
- **Secure Storage**: Files stored as encrypted blobs in AWS S3
- **Pre-signed URLs**: Direct client-to-S3 upload/download for efficiency

## 🏗️ Architecture

### Frontend (Next.js/React)
- User interface and interaction
- **All cryptographic operations**
- Zero-knowledge file encryption/decryption
- Master key derivation and management

### Backend (Supabase + Next.js API Routes)
- **Supabase**: User authentication and database
- **API Routes**: Trusted broker for S3 operations
- **Database**: Stores only encrypted metadata

### Storage (AWS S3)
- Encrypted file storage
- Pre-signed URL generation
- No knowledge of keys or content

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- AWS account with S3 access

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd zero-trust-share
npm install
```

2. **Set up environment variables:**
```bash
cp env.example .env.local
# Edit .env.local with your credentials
```

3. **Set up Supabase:**
   - Create a new Supabase project
   - Run the SQL from `supabase-schema.sql` in the SQL Editor
   - Get your project URL and keys

4. **Set up AWS S3:**
   - Create an S3 bucket
   - Configure CORS (see SETUP_GUIDE.md)
   - Create IAM user with S3 permissions

5. **Run the application:**
```bash
npm run dev
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── prepare-upload/
│   │   ├── get-file-metadata/
│   │   ├── get-file-download/
│   │   ├── record-download/
│   │   ├── my-files/
│   │   └── revoke-file/
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── share/             # File sharing pages
│   └── upload/            # File upload pages
├── components/            # React components
│   ├── AuthModal.tsx      # Authentication modal
│   ├── FileUploadProcess.tsx # File upload flow
│   ├── RecipientView.tsx  # File download interface
│   ├── DashboardView.tsx  # User dashboard
│   └── ...
└── lib/                   # Utility libraries
    ├── encryption.ts      # Zero-knowledge encryption
    ├── storage.ts         # Storage operations
    ├── supabase.ts        # Supabase client
    └── aws.ts            # AWS S3 operations
```

## 🔧 API Endpoints

### Authentication Required
- `POST /api/prepare-upload` - Prepare file upload
- `GET /api/my-files` - Get user's files
- `DELETE /api/revoke-file` - Revoke file access

### Public Access
- `GET /api/get-file-metadata/[fileId]` - Get file metadata
- `GET /api/get-file-download/[fileId]` - Get download URL
- `POST /api/record-download` - Record successful download

## 🔐 Security Features

### Encryption
- **AES-256-GCM** for file encryption
- **PBKDF2** with 100,000 iterations for key derivation
- **Random salts** for each file and user
- **Client-side only** - server never sees unencrypted data

### Privacy
- **Zero-knowledge architecture** - server has no access to content
- **Encrypted metadata** - even file names are protected
- **No server-side logging** of sensitive data
- **Pre-signed URLs** prevent server from seeing file data

### Access Control
- **Burn after read** - files auto-delete after download
- **Expiry controls** - set custom expiration times
- **Download tracking** - monitor file access
- **Revocation** - instantly revoke access

## 🧪 Testing the System

1. **Sign Up**: Create a new account
2. **Upload**: Select a file, set passcode, configure options
3. **Share**: Copy the generated share link
4. **Download**: Open link in incognito, enter passcode
5. **Dashboard**: View and manage your files

## 📚 Documentation

- [Setup Guide](SETUP_GUIDE.md) - Detailed setup instructions
- [Implementation Summary](IMPLEMENTATION_SUMMARY.md) - Technical details
- [Demo Guide](DEMO.md) - How to demonstrate the system

## 🏆 Competitive Advantages

### Innovation
- First full-stack zero-knowledge file sharing platform
- Client-side encryption with server-side storage
- Metadata protection beyond file content

### Technical Depth
- Sophisticated key derivation and management
- Pre-signed S3 URLs for efficiency
- Database-level encryption for privacy

### Real-World Impact
- Solves privacy concerns of existing solutions
- Provides enterprise-grade security
- Scalable architecture for production use

## 🤝 Contributing

This is a demonstration project showcasing zero-knowledge architecture principles. For production use, additional security measures and testing would be required.

## 📄 License

This project is for demonstration purposes. Please ensure compliance with all applicable laws and regulations when handling user data.

---

**AetherVault** - Where privacy meets innovation in file sharing.