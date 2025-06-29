# MINI-DLP: Data Loss Prevention Tool

## Overview
MINI-DLP is a comprehensive Data Loss Prevention (DLP) tool designed to protect sensitive information from unauthorized access and leakage. It scans various document types for sensitive data patterns such as PII (Personally Identifiable Information), financial data, and custom patterns defined by users.

![MINI-DLP Logo](client/public/images/mini-dlp-logo-exact.svg)

## Features

- **Secure Authentication**: Google OAuth 2.0 integration for secure user authentication
- **Document Scanning**: Detects sensitive information in multiple file formats:
  - PDF documents
  - Microsoft Word (DOCX)
  - Microsoft Excel (XLSX)
  - Plain text files (TXT)
- **Text Scanning**: Real-time analysis of pasted text for sensitive information
- **Pattern Management**: Create, view, and manage custom regex patterns
- **Document Processing**:
  - Generates highlighted versions of documents with sensitive data marked
  - Creates masked versions with sensitive information redacted
- **File Organization**: Organize processed documents in user-created folders
- **User Profiles**: Manage account settings and preferences
- **Modern UI/UX**: Responsive, cybersecurity-inspired interface that works across devices

## Default Detection Patterns

MINI-DLP comes with pre-configured detection patterns for:

- PAN (Permanent Account Number)
- Aadhaar (Indian national ID)
- Indian Passport numbers
- Email addresses
- Phone numbers
- Credit card numbers
- IP addresses (IPv4 and IPv6)
- MAC addresses
- Social Security Numbers (SSN)
- URLs
- Dates

## Project Structure

The project consists of two main components:

### 1. Client (React Frontend)
- Modern React application with responsive design
- Authentication handling with Google OAuth
- File upload and text scanning interfaces
- Pattern management UI
- Processed document viewer
- User profile management

### 2. Server (Node.js Backend)
- Express-based API server
- MongoDB database integration for data storage
- Document processing and pattern detection
- PDF generation with highlighting and masking
- User authentication and authorization
- File and pattern management

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Google Developer Account (for OAuth)

### Server Setup
1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
   ```

4. Start the server:
   ```
   node server.js
   ```

### Client Setup
1. Navigate to the client directory:
   ```
   cd client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create `.env` file (if needed for custom configurations):
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```

4. Start the development server:
   ```
   npm start
   ```

## Usage

1. **Authentication**: Log in using your Google account
2. **Document Scanning**:
   - Upload PDF, DOCX, XLSX, or TXT files for scanning
   - View highlighted and masked versions of processed documents
   - Save processed documents to your account
3. **Text Scanning**:
   - Paste text directly for quick scanning
   - See real-time detection of sensitive information
4. **Pattern Management**:
   - Create custom regex patterns for organization-specific sensitive data
   - View and manage existing patterns
5. **Document Organization**:
   - Create folders to organize your processed files
   - Move documents between folders as needed

## Security Considerations

- All sensitive data is processed server-side
- OAuth 2.0 implementation ensures secure authentication
- JWT token-based authentication for API endpoints
- Files are stored securely in MongoDB with user-specific access control

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgements

- [PDF-Parse](https://www.npmjs.com/package/pdf-parse) for PDF text extraction
- [Mammoth](https://www.npmjs.com/package/mammoth) for DOCX processing
- [SheetJS](https://www.npmjs.com/package/xlsx) for Excel file handling
- [PDF-Lib](https://www.npmjs.com/package/pdf-lib) for PDF generation and manipulation