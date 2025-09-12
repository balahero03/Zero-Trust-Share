# ZeroVault - Zero-Trust File Sharing

A secure, client-side encrypted file sharing platform where even the service provider cannot access your files.

## 🔒 Features

- **Client-Side Encryption**: Files are encrypted in your browser using AES-256-GCM before upload
- **Password Protection**: Add an extra layer of security with a password that only you and the recipient know
- **Burn After Reading**: Files can be set to self-destruct after being downloaded once
- **Link Expiration**: Set automatic expiration times for shared links
- **QR Code Sharing**: Generate QR codes for easy mobile sharing
- **Zero Knowledge**: The server never sees your files or encryption keys

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- AWS S3 bucket
- AWS credentials

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd zero-trust-share
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

Edit `.env.local` with your AWS credentials:
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_S3_BUCKET=your-bucket-name
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Architecture

### Frontend (Browser)
- **Encryption**: AES-256-GCM with PBKDF2 key derivation
- **Key Management**: Encryption keys never leave the browser
- **UI**: React with Tailwind CSS and custom animations

### Backend (API Routes)
- **Storage**: AWS S3 with pre-signed URLs
- **Metadata**: File information stored separately from encrypted data
- **Security**: No access to file contents or encryption keys

### Security Model
1. User selects file and sets password
2. Browser generates random salt and IV
3. Password is used with PBKDF2 to derive encryption key
4. File is encrypted with AES-256-GCM
5. Encrypted data is uploaded to S3
6. Shareable link is generated with password in URL fragment
7. Recipient uses password to decrypt file in their browser

## 🔧 API Endpoints

- `POST /api/upload` - Get pre-signed upload URL
- `GET /api/file/[id]/metadata` - Get file metadata
- `GET /api/file/[id]/download` - Get pre-signed download URL
- `DELETE /api/file/[id]` - Delete file (burn after read)

## 🎯 Usage

### Uploading a File
1. Enter a strong password
2. Choose security options (burn after read, expiration)
3. Drag and drop or select a file
4. Copy the shareable link and password
5. Share both through different secure channels

### Downloading a File
1. Visit the shareable link
2. Enter the password
3. File is decrypted and downloaded automatically
4. If burn after read is enabled, file is deleted after download

## 🛡️ Security Features

- **AES-256-GCM Encryption**: Industry-standard encryption
- **PBKDF2 Key Derivation**: 100,000 iterations for password hashing
- **Random IV/Salt**: Unique values for each encryption
- **Client-Side Only**: Encryption/decryption never leaves the browser
- **Pre-signed URLs**: Direct browser-to-S3 communication
- **No Server Access**: Server cannot decrypt files even if compromised

## 🎨 UI Features

- **Dark Theme**: Modern dark mode design
- **Animations**: Smooth transitions and loading states
- **Responsive**: Works on desktop and mobile
- **QR Codes**: Easy mobile sharing
- **Progress Bars**: Real-time upload/download progress
- **Glass Morphism**: Modern UI effects

## 📱 Mobile Support

- Responsive design works on all devices
- QR code generation for easy mobile sharing
- Touch-friendly interface
- Optimized for mobile browsers

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## 🔍 Development

### Project Structure
```
src/
├── app/                 # Next.js app router
│   ├── api/            # API routes
│   ├── file/[id]/      # File download page
│   └── page.tsx        # Main upload page
├── components/         # React components
│   ├── FileUpload.tsx  # Upload interface
│   ├── FileShare.tsx   # Share interface
│   ├── FileDownload.tsx # Download interface
│   └── QRCode.tsx      # QR code generator
└── lib/               # Utilities
    ├── encryption.ts   # Crypto functions
    └── storage.ts      # S3 integration
```

### Key Technologies
- **Next.js 15**: React framework with app router
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **AWS SDK**: S3 integration
- **Web Crypto API**: Client-side encryption

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Security Notice

This is a demonstration project. For production use:
- Use a dedicated S3 bucket
- Implement rate limiting
- Add input validation
- Consider additional security measures
- Regular security audits

## 🆘 Support

For issues and questions:
- Check the GitHub issues
- Review the documentation
- Contact the maintainers

---

**Remember**: Even with this secure system, always share passwords through separate secure channels (SMS, Signal, etc.) and never in the same message as the link.
