# ZeroVault Demo Script

## 🎯 Demo Overview
**Duration**: 3-4 minutes  
**Goal**: Demonstrate zero-trust file sharing with client-side encryption

## 🎬 Demo Flow

### 1. Introduction (30 seconds)
- "Meet ZeroVault - a file sharing platform where even we, the developers, cannot see your files"
- Show the landing page with the tagline: "Share Files Without Trusting Anyone"
- Highlight the three key features: Client-Side Encryption, Password Protection, Burn After Reading

### 2. File Upload Demo (90 seconds)
- **Step 1**: Enter a password (e.g., "MySecret123!")
- **Step 2**: Enable "Burn After Reading" checkbox
- **Step 3**: Set expiration to "1 hour"
- **Step 4**: Drag and drop a file (PDF, image, or document)
- **Step 5**: Watch the encryption progress bar
- **Step 6**: Show the generated shareable link and password

**Key Points to Emphasize**:
- "Notice the encryption happens entirely in your browser"
- "The password is never sent to our servers"
- "Even if someone intercepts the upload, they can't decrypt it"

### 3. Sharing Demo (60 seconds)
- **Step 1**: Copy the shareable link
- **Step 2**: Show the QR code feature
- **Step 3**: Explain the security model:
  - "Send the link through one channel (email, Slack)"
  - "Send the password through another channel (SMS, Signal)"
  - "Both are needed to access the file"

### 4. Download Demo (90 seconds)
- **Step 1**: Open the shareable link in a new browser/incognito window
- **Step 2**: Enter the password
- **Step 3**: Watch the decryption progress
- **Step 4**: File downloads automatically
- **Step 5**: Show the "burn after read" effect - refresh the page to show file is gone

**Key Points to Emphasize**:
- "Decryption happens entirely in the recipient's browser"
- "The file is automatically deleted after download"
- "We never had access to the file contents"

### 5. Security Explanation (30 seconds)
- "Let's verify our zero-knowledge claim"
- Show the browser developer tools network tab
- "Notice: only encrypted data is transmitted"
- "The encryption key never leaves the browser"

## 🎭 Demo Tips

### For Maximum Impact:
1. **Use a dramatic file**: Share a "confidential document" or "secret photo"
2. **Show the network tab**: Demonstrate that only encrypted data is sent
3. **Use incognito mode**: Show it works across different browsers
4. **Test burn after read**: Refresh to show the file is gone
5. **Emphasize the password separation**: "Never share both in the same message"

### Technical Deep Dive (if asked):
- **AES-256-GCM**: Industry-standard encryption
- **PBKDF2**: 100,000 iterations for password hashing
- **Web Crypto API**: Browser-native encryption
- **Pre-signed URLs**: Direct browser-to-S3 communication
- **Zero-knowledge architecture**: Server is just a "dumb storage broker"

## 🚨 Common Questions & Answers

**Q: What if someone gets the link?**
A: They still need the password, which should be shared through a different secure channel.

**Q: What if the password is weak?**
A: We recommend strong passwords, but the system is designed so that even weak passwords provide encryption that we cannot break.

**Q: Can you see the files?**
A: No. The encryption happens in the browser, and we never have access to the encryption keys.

**Q: What happens if I forget the password?**
A: The file cannot be recovered. This is by design - we cannot help you recover files because we don't have access to them.

**Q: Is this really secure?**
A: Yes. We use industry-standard AES-256-GCM encryption with PBKDF2 key derivation. The same encryption used by banks and governments.

## 🎯 Closing Statement

"In a world of data breaches and surveillance, ZeroVault proves that secure file sharing is possible without trusting the service provider. We built a vault that even we cannot open."

## 🔧 Demo Setup Checklist

- [ ] AWS S3 bucket configured
- [ ] Environment variables set
- [ ] Test file ready (PDF or image)
- [ ] Browser developer tools ready
- [ ] Incognito window ready
- [ ] Mobile device for QR code demo
- [ ] Backup demo file in case of issues

## 📱 Mobile Demo (Optional)

- Show QR code generation
- Scan with phone camera
- Demonstrate mobile download
- Show responsive design

---

**Remember**: The key to a successful demo is showing the "magic moment" - when the file appears after decryption, proving that the system works while maintaining zero knowledge of the content.
