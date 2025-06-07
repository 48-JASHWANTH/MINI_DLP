# MINI-DLP Server

This is the server component of the MINI-DLP (Data Loss Prevention) system.

## Features

- Detects sensitive information in text and uploaded files
- Supports various file formats (PDF, DOCX, XLSX, TXT)
- Generates highlighted and masked versions of documents
- Supports custom patterns alongside default patterns

## Installation

1. Install dependencies:
```
npm install
```

2. Create a `.env` file with the following variables:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

3. Start the server:
```
node server.js
```

## API Endpoints

### Pattern Management

- `GET /api/patterns` - Get all custom patterns
- `POST /api/patterns` - Add a new custom pattern
- `DELETE /api/patterns/:index` - Delete a custom pattern by index

### Document Processing

- `POST /api/check-text` - Check text for sensitive information
- `POST /api/upload-file` - Upload and process a file for sensitive information
- `GET /api/view/:filename` - View a processed file
- `GET /api/download/:filename` - Download a processed file

## Custom Patterns

The system supports creating custom patterns for detecting sensitive information. Custom patterns can be added through the API and will be used alongside the default patterns when scanning documents.

### Pattern Structure

A custom pattern consists of:

- `name` - A descriptive name for the pattern (e.g., "CustomID")
- `pattern` - A regular expression pattern string (e.g., "ID-\\d{6}")
- `requiresValidation` - Boolean flag indicating whether the pattern requires validation

### Example Custom Pattern

```json
{
  "name": "CustomID",
  "pattern": "ID-\\d{6}",
  "requiresValidation": false
}
```

### Validation

When `requiresValidation` is set to `true`, the system will apply additional validation to matches beyond just the regular expression. This helps reduce false positives.

The validation logic is based on the pattern name:
- Patterns with "Phone" or "Mobile" in the name will validate for proper phone number formats
- Patterns with "Email" will validate for proper email formats
- Patterns with "ID" or "Number" will validate that they contain expected digits
- Patterns with "Date" will validate for proper date formats

## Default Patterns

The system includes several default patterns for common sensitive information:

- PAN (Permanent Account Number)
- Aadhaar (Indian national ID)
- Indian Passport
- Email addresses
- Phone numbers
- Credit card numbers
- IP addresses (IPv4 and IPv6)
- MAC addresses
- Social Security Numbers (SSN)
- URLs
- Dates 