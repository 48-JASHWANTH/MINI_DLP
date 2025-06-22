const pdf = require("pdf-parse");
const fs = require("fs");
const store = require("../store");
const mammoth = require("mammoth");
const xlsx = require("xlsx");
const path = require("path");
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const docx = require("docx");
const { Document, Paragraph, TextRun } = docx;
const FileModel = require("../models/fileModel");
const UserModel = require("../models/userModel");
const mongoose = require("mongoose");

exports.checkText = async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Text is required" });

  console.log('\n[checkText] ========== START TEXT CHECKING ==========');
  console.log('[checkText] Received text of length:', text.length);

  // Get custom patterns from the user object if authenticated
  let userPatterns = [];
  if (req.user && req.user.customPatterns) {
    userPatterns = req.user.customPatterns.map(p => ({
      name: p.name,
      pattern: p.pattern,
      requiresValidation: p.requiresValidation,
      isCustom: true
    }));
    console.log('[checkText] Retrieved user-specific patterns from user object. Count:', userPatterns.length);
  } else {
    // If no user is authenticated, fall back to store patterns
    userPatterns = store.getCustomPatterns();
    console.log('[checkText] No user authenticated, using global store patterns. Count:', userPatterns.length);
  }
  
  // Log custom patterns for debugging
  if (userPatterns.length > 0) {
    console.log('[checkText] Custom patterns to use:');
    userPatterns.forEach((pattern, index) => {
      console.log(`  ${index + 1}. ${pattern.name} (pattern: ${pattern.pattern}, requiresValidation: ${pattern.requiresValidation}, isCustom: ${pattern.isCustom})`);
    });
  } else {
    console.log('[checkText] No custom patterns available');
  }

  // Use all patterns for scanning (both default and custom)
  console.log('[checkText] Calling processText with custom patterns and default patterns');
  const matches = processText(text, userPatterns, true);
  console.log('[checkText] Processing complete. Detected patterns:', matches.length);
  
  if (matches.length > 0) {
    console.log('[checkText] Pattern types detected:', matches.map(m => m.patternName).join(', '));
    
    // Count total matches
    const totalMatches = matches.reduce((acc, pattern) => {
      const patternMatchCount = pattern.matches.reduce((patternAcc, match) => {
        return patternAcc + match.matches.length;
      }, 0);
      return acc + patternMatchCount;
    }, 0);
    
    console.log('[checkText] Total individual matches:', totalMatches);
  } else {
    console.log('[checkText] No patterns detected');
  }
  
  console.log('[checkText] ========== END TEXT CHECKING ==========\n');
  res.json({ matches });
};

exports.processFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    console.log('\n[processFile] ========== START FILE PROCESSING ==========');
    console.log('[processFile] Processing file:', req.file.originalname);
    console.log('[processFile] User authenticated:', !!req.user);
    
    // Check if a folder ID was provided
    const folderId = req.body.folderId || null;
    if (folderId) {
      console.log('[processFile] File will be assigned to folder:', folderId);
    }
    
    const fileBuffer = req.file.buffer;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    let text;

    // Process different file types
    switch (fileExtension) {
      case ".pdf":
        console.log('[processFile] Extracting text from PDF');
        const pdfData = await pdf(fileBuffer);
        text = pdfData.text;
        break;

      case ".docx":
        console.log('[processFile] Extracting text from DOCX');
        const mammothResult = await mammoth.extractRawText({ buffer: fileBuffer });
        text = mammothResult.value;
        break;

      case ".xlsx":
        console.log('[processFile] Extracting text from XLSX');
        const workbook = xlsx.read(fileBuffer);
        text = extractTextFromWorkbook(workbook);
        break;

      case ".txt":
        console.log('[processFile] Reading text file');
        text = fileBuffer.toString('utf8');
        break;

      default:
        return res.status(400).json({ error: "Unsupported file type" });
    }
    
    console.log('[processFile] Extracted text of length:', text.length);

    // Get custom patterns from the user object if authenticated
    let userPatterns = [];
    if (req.user && req.user.customPatterns) {
      userPatterns = req.user.customPatterns.map(p => ({
        name: p.name,
        pattern: p.pattern,
        requiresValidation: p.requiresValidation,
        isCustom: true
      }));
      console.log('[processFile] Retrieved user-specific patterns from user object. Count:', userPatterns.length);
      
      if (userPatterns.length > 0) {
        console.log('[processFile] First user pattern:', JSON.stringify(userPatterns[0], null, 2));
      }
    } else {
      // If no user is authenticated, fall back to store patterns
      userPatterns = store.getCustomPatterns();
      console.log('[processFile] No user authenticated, using global store patterns. Count:', userPatterns.length);
    }
    
    // Log custom patterns for debugging
    if (userPatterns.length > 0) {
      console.log('[processFile] Custom patterns to use:');
      userPatterns.forEach((pattern, index) => {
        console.log(`  ${index + 1}. ${pattern.name} (pattern: ${pattern.pattern}, requiresValidation: ${pattern.requiresValidation}, isCustom: ${pattern.isCustom})`);
      });
    } else {
      console.log('[processFile] No custom patterns available');
    }

    // Use all patterns for scanning (both default and custom)
    console.log('[processFile] Calling processText with custom patterns and default patterns');
    const matches = processText(text, userPatterns, true);
    console.log('[processFile] Processing complete. Detected patterns:', matches.length);
    
    if (matches.length > 0) {
      console.log('[processFile] Pattern types detected:', matches.map(m => m.patternName).join(', '));
    } else {
      console.log('[processFile] No patterns detected');
    }
    
    // Generate highlighted and masked versions
    console.log('[processFile] Generating highlighted and masked PDFs');
    const highlightedPdf = await createHighlightedPDF(text, matches);
    const maskedPdf = await createMaskedPDF(text, matches);

    const timestamp = Date.now();
    const highlightedFileName = `highlighted-${timestamp}.pdf`;
    const maskedFileName = `masked-${timestamp}.pdf`;

    // Debug info
    console.log('[processFile] File buffer type:', fileBuffer.constructor.name);
    console.log('[processFile] Highlighted PDF type:', highlightedPdf.constructor.name);
    console.log('[processFile] Masked PDF type:', maskedPdf.constructor.name);

    // Save original file to database
    const originalFile = new FileModel({
      originalName: req.file.originalname,
      fileName: `original-${timestamp}${fileExtension}`,
      fileType: fileExtension,
      fileSize: req.file.size,
      fileData: Buffer.from(fileBuffer),
      userId: req.user ? req.user._id : null,
      folderId: folderId || null
    });
    
    try {
      await originalFile.save();
      console.log('[processFile] Successfully saved original file');
    } catch (error) {
      console.error('[processFile] Error saving original file:', error);
      throw error;
    }
    
    // Save highlighted PDF to database
    const highlightedFile = new FileModel({
      originalName: req.file.originalname,
      fileName: highlightedFileName,
      fileType: '.pdf',
      fileSize: Buffer.byteLength(highlightedPdf),
      fileData: Buffer.from(highlightedPdf),
      userId: req.user ? req.user._id : null,
      folderId: folderId || null,
      isHighlighted: true,
      originalFileId: originalFile._id
    });
    
    try {
      await highlightedFile.save();
      console.log('[processFile] Successfully saved highlighted file');
    } catch (error) {
      console.error('[processFile] Error saving highlighted file:', error);
      throw error;
    }
    
    // Save masked PDF to database
    const maskedFile = new FileModel({
      originalName: req.file.originalname,
      fileName: maskedFileName,
      fileType: '.pdf',
      fileSize: Buffer.byteLength(maskedPdf),
      fileData: Buffer.from(maskedPdf),
      userId: req.user ? req.user._id : null,
      folderId: folderId || null,
      isMasked: true,
      originalFileId: originalFile._id
    });
    
    await maskedFile.save();

    // If user is authenticated, associate files with user
    if (req.user) {
      console.log('[processFile] Associating files with user:', req.user._id);
      
      // Validate folderId if provided
      if (folderId) {
        // Check if folder exists for this user
        const user = await UserModel.findById(req.user._id);
        const folderExists = user.folders.some(folder => 
          folder._id.toString() === folderId
        );
        
        if (!folderExists) {
          console.log('[processFile] Warning: Provided folder ID does not exist for this user. File will not be associated with a folder.');
        }
      }
      
      // Add files to user's processedFiles
      await UserModel.findByIdAndUpdate(req.user._id, {
        $push: {
          processedFiles: {
            originalName: req.file.originalname,
            highlightedVersion: highlightedFile._id,
            maskedVersion: maskedFile._id,
            processedAt: new Date(),
            fileSize: req.file.size + Buffer.byteLength(highlightedPdf) + Buffer.byteLength(maskedPdf),
            fileType: fileExtension,
            folderId: folderId || null
          }
        }
      });
    }
    
    console.log('[processFile] ========== END FILE PROCESSING ==========\n');

    res.json({
      matches,
      text,
      highlightedFileId: highlightedFile._id,
      maskedFileId: maskedFile._id
    });
  } catch (error) {
    console.error("[processFile] Error processing file:", error);
    res.status(500).json({ error: "Error processing file" });
  }
};

// Helper function to extract text from Excel workbook
function extractTextFromWorkbook(workbook) {
  let extractedText = "";

  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const sheetData = xlsx.utils.sheet_to_csv(sheet);
    extractedText += sheetData + "\n";
  });

  return extractedText;
}

// Add validation functions
function isValidAadhaar(aadhaar) {
  // Remove spaces and any non-digit characters
  aadhaar = aadhaar.replace(/\D/g, "");
  if (aadhaar.length !== 12) return false;
  if (!/^\d+$/.test(aadhaar)) return false;
  if (aadhaar[0] === "0" || aadhaar[0] === "1") return false;
  return true;
}

function isValidDate(dateStr) {
  // Remove any non-date characters
  const cleanDateStr = dateStr.replace(/[^\d\-\/]/g, '');
  const date = new Date(cleanDateStr);
  return !isNaN(date) && date.getFullYear() > 1900 && date.getFullYear() < 2100;
}

function isValidPAN(pan) {
  // Strip any extra characters that might be captured with the pattern
  pan = pan.replace(/[^A-Z0-9]/g, '');
  if (pan.length !== 10) return false;
  if (!/^[A-Z]{5}/.test(pan.slice(0, 5))) return false;
  if (!/\d{4}/.test(pan.slice(5, 9))) return false;
  if (!/[A-Z]/.test(pan[9])) return false;
  return true;
}

function isValidIndianPassport(passportNumber) {
  // Clean up the passport number
  passportNumber = passportNumber.trim().replace(/[^A-Z0-9]/g, '');
  if (passportNumber.length !== 8) return false;
  if (!/[A-Z]/.test(passportNumber[0])) return false;
  if (!/\d{7}/.test(passportNumber.slice(1))) return false;
  return true;
}

function isValidPhonenumbers(phoneNumber) {
  // Accept various phone number formats, with or without country code
  phoneNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
  
  // Check for international format with + sign
  if (phoneNumber.startsWith('+')) {
  return /^\+\d{8,15}$/.test(phoneNumber);
  }
  
  // Check for 10-digit Indian phone numbers
  if (phoneNumber.length === 10 && /^\d{10}$/.test(phoneNumber)) {
    return true;
  }
  
  // Check for numbers with country code without + sign
  if (phoneNumber.length >= 11 && phoneNumber.length <= 15 && /^\d+$/.test(phoneNumber)) {
    return true;
  }
  
  return false;
}

function isValidIPv4(ip) {
  // Clean the IP address
  const matches = ip.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/);
  if (!matches) return false;
  
  const cleanIp = matches[0];
  return cleanIp.split(".").every(part => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
}

function isValidIPv6(ip) {
  // Handle potential complex matches by extracting the IPv6 part
  try {
    const matches = ip.match(/([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}/);
    if (!matches) return false;
    
    // Further validation: check if it's a valid IPv6 format
    const parts = matches[0].split(':');
    if (parts.length !== 8) return false;
    
    return parts.every(part => /^[0-9a-fA-F]{1,4}$/.test(part));
  } catch (e) {
    return false;
  }
}

function isValidMACAddress(mac) {
  // Clean up the MAC address
  const standardFormat = /([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}/;
  const noSeparators = /[0-9A-Fa-f]{12}/;
  
  if (standardFormat.test(mac)) {
    // Check that each hexadecimal part is valid
    const parts = mac.split(/[:-]/);
    return parts.length === 6 && parts.every(part => /^[0-9A-Fa-f]{2}$/.test(part));
  }
  
  return noSeparators.test(mac);
}

function isValidURL(url) {
  try {
    // Try to create a URL object - this will validate most URLs
    new URL(url);
    
    // Additional check for http/https protocol
    return url.startsWith('http://') || url.startsWith('https://');
  } catch (e) {
    return false;
  }
}

function isValidEmail(email) {
  // RFC 5322 compliant email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
}

function isValidCreditCard(cardNumber) {
  // Remove spaces and dashes
  cardNumber = cardNumber.replace(/[\s-]/g, '');
  
  // Check if the card number has valid length and valid prefix
  const visaRegex = /^4[0-9]{12}(?:[0-9]{3})?$/;
  const mastercardRegex = /^5[1-5][0-9]{14}$/;
  const amexRegex = /^3[47][0-9]{13}$/;
  const discoverRegex = /^6(?:011|5[0-9]{2})[0-9]{12}$/;
  
  // Run Luhn algorithm check
  if (visaRegex.test(cardNumber) || mastercardRegex.test(cardNumber) || 
      amexRegex.test(cardNumber) || discoverRegex.test(cardNumber)) {
    
    // Luhn algorithm implementation
    let sum = 0;
    let doubleUp = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber.charAt(i));
      
      if (doubleUp) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      doubleUp = !doubleUp;
    }
    
    return sum % 10 === 0;
  }
  
  return false;
}

function isValidSSN(ssn) {
  // Strip any spaces or dashes
  ssn = ssn.replace(/[\s-]/g, '');
  
  // Check if it's a valid SSN (9 digits, not all zeros in each group)
  if (ssn.length !== 9) return false;
  if (!/^\d{9}$/.test(ssn)) return false;
  
  // Check that it doesn't have all zeros in any group
  const area = ssn.substr(0, 3);
  const group = ssn.substr(3, 2);
  const serial = ssn.substr(5, 4);
  
  if (area === '000' || group === '00' || serial === '0000') return false;
  if (area === '666') return false; // Area 666 is invalid
  if (parseInt(area) >= 900) return false; // Areas 900-999 are invalid
  
  return true;
}

// Update the processText function to optionally skip default patterns
function processText(text, userPatterns = [], useDefaultPatterns = true) {
  console.log('\n[processText] Starting text processing');
  console.log('[processText] User patterns provided:', userPatterns.length);
  console.log('[processText] Use default patterns:', useDefaultPatterns);
  
  const matches = [];
  
  // Get patterns based on useDefaultPatterns flag
  let allPatterns = [];
  if (useDefaultPatterns) {
    const defaultPatterns = store.getDefaultPatterns().map(p => ({...p, isCustom: false}));
    console.log('[processText] Default patterns loaded:', defaultPatterns.length);
    allPatterns = [...defaultPatterns, ...userPatterns];
  } else {
    allPatterns = [...userPatterns];
  }
  
  console.log('[processText] Total patterns to process:', allPatterns.length);
  if (allPatterns.length > 0) {
    console.log('[processText] Pattern names:', allPatterns.map(p => p.name).join(', '));
  }
  
  const normalizedText = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalizedText.split("\n");
  console.log('[processText] Text normalized. Total lines:', lines.length);

  lines.forEach((line, lineNumber) => {
    if (line.trim()) {
      allPatterns.forEach((patternObj) => {
        const { name, pattern, requiresValidation, isCustom } = patternObj;
        
        try {
          // Fix: Don't add word boundaries if the pattern already has them
          // or if the pattern uses start/end anchors (^ or $)
          let wordBoundaryPattern = pattern;
          if (!pattern.includes("\\b") && !pattern.startsWith("^") && !pattern.endsWith("$")) {
            wordBoundaryPattern = `\\b${pattern}\\b`;
          }
          
          console.log(`[processText] Processing pattern "${name}" (custom: ${!!isCustom}, validation: ${!!requiresValidation})`);
          console.log(`[processText] Original pattern: ${pattern}`);
          console.log(`[processText] Modified pattern: ${wordBoundaryPattern}`);

          const regex = new RegExp(wordBoundaryPattern, "gi");
          let match;
          const foundMatches = new Set();

          // Use exec loop instead of test to get all matches in the line
          while ((match = regex.exec(line)) !== null) {
            const matchedText = match[0];
            console.log(`[processText] Found potential match for "${name}": "${matchedText}" at line ${lineNumber + 1}`);
              
              // Apply validation if required
              let isValid = true; // Default to true if no validation required
              
              if (requiresValidation) {
              console.log(`[processText] Validating match "${matchedText}" for pattern "${name}"`);
                
              // For custom patterns that require validation but don't have specific validation functions,
              // use a regex test or a default validation based on the pattern name
                switch (name) {
                  case "Aadhaar":
                  isValid = isValidAadhaar(matchedText);
                    break;
                  case "PAN":
                  isValid = isValidPAN(matchedText);
                    break;
                  case "IndianPassport":
                  isValid = isValidIndianPassport(matchedText);
                    break;
                  case "PhoneNumber":
                case "CustomPhoneNumber": // Handle custom phone pattern
                  // Extract numeric part for validation if it has a TEL- prefix
                  if (matchedText.startsWith("TEL-")) {
                    const numericPart = matchedText.substring(4);
                    isValid = /^\d{10}$/.test(numericPart);
                    console.log(`[processText] CustomPhoneNumber validation - numeric part: "${numericPart}", valid: ${isValid}`);
                  } else {
                    isValid = isValidPhonenumbers(matchedText);
                  }
                    break;
                  case "IPv4":
                  isValid = isValidIPv4(matchedText);
                    break;
                  case "IPv6":
                  isValid = isValidIPv6(matchedText);
                    break;
                  case "MACAddress":
                  isValid = isValidMACAddress(matchedText);
                    break;
                  case "Date":
                  isValid = isValidDate(matchedText);
                  break;
                case "Email":
                  isValid = isValidEmail(matchedText);
                  break;
                case "URL":
                  isValid = isValidURL(matchedText);
                  break;
                case "CreditCard":
                  isValid = isValidCreditCard(matchedText);
                  break;
                case "SSN":
                  isValid = isValidSSN(matchedText);
                    break;
                // For any custom pattern with validation requirement
                default:
                  // If it's a custom pattern with requiresValidation=true
                  // but no specific validation function, we do a simple format check
                  if (isCustom) {
                    console.log(`[processText] Using generic validation for custom pattern "${name}"`);
                    // Try to extract a validation type from the pattern name
                    if (name.includes("Phone") || name.includes("Mobile")) {
                      // For phone number patterns
                      isValid = /\d{10,15}/.test(matchedText.replace(/\D/g, ''));
                    } else if (name.includes("Email")) {
                      // For email patterns
                      isValid = isValidEmail(matchedText);
                    } else if (name.includes("ID") || name.includes("Number")) {
                      // For ID patterns, check if it contains digits as expected
                      isValid = /\d+/.test(matchedText);
                    } else if (name.includes("Date")) {
                      // For date patterns
                      isValid = isValidDate(matchedText);
                    } else {
                      // For any other pattern, consider it valid if it matches the regex
                      isValid = true;
                    }
                  } else {
                    // Default to true for any other case
                    isValid = true;
                  }
                  break;
              }
              console.log(`[processText] Validation result for "${matchedText}": ${isValid ? 'VALID' : 'INVALID'}`);
              }

              if (isValid) {
              foundMatches.add(matchedText);
              console.log(`[processText] Valid match added: "${matchedText}" for pattern "${name}"`);
            }
          }

          if (foundMatches.size > 0) {
            const matchArray = Array.from(foundMatches);
            console.log(`[processText] Total valid matches for "${name}": ${matchArray.length}`);
            
            // Include pattern type (default or custom) in the result
            const existingMatch = matches.find((m) => m.patternName === name);

            if (existingMatch) {
              existingMatch.matches.push({
                line: lineNumber + 1,
                content: line.trim(),
                matches: matchArray,
              });
              console.log(`[processText] Added matches to existing pattern "${name}"`);
            } else {
              matches.push({
                patternName: name,
                isCustom: !!isCustom,
                requiresValidation: !!requiresValidation,
                matches: [
                  {
                    line: lineNumber + 1,
                    content: line.trim(),
                    matches: matchArray,
                  },
                ],
              });
              console.log(`[processText] Created new pattern entry for "${name}"`);
            }
          } else {
            console.log(`[processText] No valid matches found for pattern "${name}"`);
          }
        } catch (error) {
          console.error(`[processText] Error processing pattern "${name}":`, error);
        }
      });
    }
  });
  
  console.log(`[processText] Processing complete. Total pattern types detected: ${matches.length}`);
  if (matches.length > 0) {
    console.log('[processText] Detected pattern names:', matches.map(m => m.patternName).join(', '));
  }

  return matches;
}

// Add these helper functions for document generation
async function createHighlightedPDF(content, matches) {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  const fontSize = 12;
  let currentY = page.getHeight() - 50;
  const lineHeight = fontSize * 1.2;
  
  // Flatten all matches into a single array with their patterns
  const allMatches = matches.reduce((acc, pattern) => {
    pattern.matches.forEach(match => {
      match.matches.forEach(m => {
        acc.push({
          text: m,
          pattern: pattern.patternName
        });
      });
    });
    return acc;
  }, []);
  
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.trim() === '') {
      currentY -= lineHeight;
      continue;
    }
    
    let currentX = 50;
    let remainingLine = line;
    
    // Find all matches in this line
    const lineMatches = allMatches.filter(match => 
      remainingLine.includes(match.text)
    );
    
    if (lineMatches.length > 0) {
      while (remainingLine.length > 0) {
        let nextMatch = null;
        let nextMatchIndex = remainingLine.length;
        
        // Find the next closest match
        for (const match of lineMatches) {
          const index = remainingLine.indexOf(match.text);
          if (index !== -1 && index < nextMatchIndex) {
            nextMatch = match;
            nextMatchIndex = index;
          }
        }
        
        if (nextMatch && nextMatchIndex !== remainingLine.length) {
          // Draw text before match
          if (nextMatchIndex > 0) {
            const beforeText = remainingLine.substring(0, nextMatchIndex);
            page.drawText(beforeText, {
              x: currentX,
              y: currentY,
              font,
              size: fontSize,
              color: rgb(0, 0, 0)
            });
            currentX += font.widthOfTextAtSize(beforeText, fontSize);
          }
          
          // Draw highlighted match
          const matchText = nextMatch.text;
          const matchWidth = font.widthOfTextAtSize(matchText, fontSize);
          
          // Draw yellow highlight
          page.drawRectangle({
            x: currentX - 1,
            y: currentY - 2,
            width: matchWidth + 2,
            height: fontSize + 4,
            color: rgb(1, 1, 0),
            opacity: 0.3
          });
          
          // Draw red text
          page.drawText(matchText, {
            x: currentX,
            y: currentY,
            font,
            size: fontSize,
            color: rgb(1, 0, 0)
          });
          
          currentX += matchWidth;
          remainingLine = remainingLine.substring(nextMatchIndex + matchText.length);
        } else {
          // Draw remaining text
          page.drawText(remainingLine, {
            x: currentX,
            y: currentY,
            font,
            size: fontSize,
            color: rgb(0, 0, 0)
          });
          break;
        }
      }
    } else {
      // Draw normal line
      page.drawText(line, {
        x: 50,
        y: currentY,
        font,
        size: fontSize,
        color: rgb(0, 0, 0)
      });
    }
    
    currentY -= lineHeight;
    if (currentY < 50) {
      page = pdfDoc.addPage();
      currentY = page.getHeight() - 50;
    }
  }
  
  return await pdfDoc.save();
}

async function createMaskedPDF(content, matches) {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  // Flatten all matches
  const allMatches = matches.reduce((acc, pattern) => {
    pattern.matches.forEach(match => {
      match.matches.forEach(m => {
        acc.push(m);
      });
    });
    return acc;
  }, []);
  
  // Sort matches by length (longest first) to handle overlapping matches
  allMatches.sort((a, b) => b.length - a.length);
  
  // Create masked content
  let maskedContent = content;
  allMatches.forEach(match => {
    const regex = new RegExp(match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    maskedContent = maskedContent.replace(regex, '*'.repeat(match.length));
  });
  
  const fontSize = 12;
  let currentY = page.getHeight() - 50;
  const lineHeight = fontSize * 1.2;
  
  const lines = maskedContent.split('\n');
  for (const line of lines) {
    if (line.trim() !== '') {
      page.drawText(line, {
        x: 50,
        y: currentY,
        font,
        size: fontSize,
        color: rgb(0, 0, 0)
      });
    }
    currentY -= lineHeight;
    
    if (currentY < 50) {
      page = pdfDoc.addPage();
      currentY = page.getHeight() - 50;
    }
  }
  
  return await pdfDoc.save();
}

// Update the view and download endpoints to retrieve files from the database
exports.viewFile = async (req, res) => {
  const { fileId } = req.params;
  
  try {
    const file = await FileModel.findById(fileId);
  
    if (!file) {
    return res.status(404).json({ error: "File not found" });
  }

  res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${file.fileName}"`);
    res.send(file.fileData);
  } catch (error) {
    console.error("[viewFile] Error retrieving file:", error);
    res.status(500).json({ error: "Error retrieving file" });
  }
};

exports.downloadFile = async (req, res) => {
  const { fileId } = req.params;
  
  try {
    const file = await FileModel.findById(fileId);
  
    if (!file) {
    return res.status(404).json({ error: "File not found" });
  }

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
    res.send(file.fileData);
  } catch (error) {
    console.error("[downloadFile] Error downloading file:", error);
    res.status(500).json({ error: "Error downloading file" });
  }
};

// Analytics endpoint to get statistics on processed files and patterns
exports.getAnalytics = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required for analytics" });
    }

    const user = await UserModel.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get processed files data
    const processedFiles = user.processedFiles || [];
    
    // Count files by type
    const fileTypeCount = {};
    processedFiles.forEach(file => {
      const fileType = file.fileType || 'unknown';
      if (!fileTypeCount[fileType]) {
        fileTypeCount[fileType] = 0;
      }
      fileTypeCount[fileType]++;
    });

    // Group files by date (monthly)
    const filesByMonth = {};
    processedFiles.forEach(file => {
      const date = new Date(file.processedAt);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      if (!filesByMonth[monthYear]) {
        filesByMonth[monthYear] = 0;
      }
      filesByMonth[monthYear]++;
    });

    // Calculate total and average file size
    let totalSize = 0;
    processedFiles.forEach(file => {
      totalSize += file.fileSize || 0;
    });
    const averageSize = processedFiles.length > 0 ? Math.round(totalSize / processedFiles.length) : 0;

    // Get user patterns data
    const userPatterns = user.customPatterns || [];
    
    // Analyze files for risk metrics (mocked data - in a real implementation this would be stored with each file)
    // This is simplification - in a production system you would store risk scores with each processed file
    const riskLevels = ['Low', 'Medium', 'High'];
    const riskDistribution = {};
    const patternOccurrences = {};
    
    // Initialize pattern occurrences
    userPatterns.forEach(pattern => {
      patternOccurrences[pattern.name] = 0;
    });
    
    // Default patterns
    const defaultPatterns = ['Credit Card', 'SSN', 'Phone Number', 'Email', 'Aadhaar'];
    defaultPatterns.forEach(pattern => {
      patternOccurrences[pattern] = 0;
    });
    
    // Mock risk levels and pattern occurrences based on file count
    for (let i = 0; i < processedFiles.length; i++) {
      // Assign mock risk levels
      const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];
      if (!riskDistribution[riskLevel]) {
        riskDistribution[riskLevel] = 0;
      }
      riskDistribution[riskLevel]++;
      
      // Assign mock pattern occurrences
      const patternKeys = Object.keys(patternOccurrences);
      const patternCount = Math.floor(Math.random() * 3) + 1; // 1-3 patterns per file
      for (let j = 0; j < patternCount; j++) {
        const randomPattern = patternKeys[Math.floor(Math.random() * patternKeys.length)];
        patternOccurrences[randomPattern]++;
      }
    }
    
    // Sort pattern occurrences by count (descending)
    const sortedPatternOccurrences = Object.entries(patternOccurrences)
      .filter(([_, count]) => count > 0) // Only include patterns that occurred
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5) // Get top 5
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});
    
    res.json({
      totalDocuments: processedFiles.length,
      fileTypeDistribution: fileTypeCount,
      processedByMonth: filesByMonth,
      totalPatterns: userPatterns.length,
      totalStorageUsed: totalSize,
      averageFileSize: averageSize,
      // Risk metrics
      riskDistribution: riskDistribution,
      // Pattern detection stats
      topDetectedPatterns: sortedPatternOccurrences,
      // Recent files
      recentFiles: processedFiles.slice(-5).map(file => ({
        name: file.originalName,
        date: file.processedAt,
        type: file.fileType,
        size: file.fileSize
      }))
    });
  } catch (error) {
    console.error("Error generating analytics:", error);
    res.status(500).json({ error: "Failed to generate analytics data" });
  }
};

// Save processed files
exports.saveProcessedFiles = async (req, res) => {
  try {
    const { highlightedFileId, maskedFileId, folderId } = req.body;

    // Validate IDs
    if (!highlightedFileId || !maskedFileId) {
      return res.status(400).json({ error: "File IDs are required" });
    }

    // Validate folder ID if provided
    if (folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
      return res.status(400).json({ error: "Invalid folder ID" });
    }

    // Check if files exist
    const highlightedFile = await FileModel.findById(highlightedFileId);
    const maskedFile = await FileModel.findById(maskedFileId);

    if (!highlightedFile || !maskedFile) {
      return res.status(404).json({ error: "Files not found" });
    }

    // Check if folder exists if folderId is provided
    if (folderId) {
      const user = await UserModel.findById(req.user._id);
      const folderExists = user.folders.some(folder => 
        folder._id.toString() === folderId
      );

      if (!folderExists) {
        return res.status(404).json({ error: "Folder not found" });
      }
    }

    // Update both files with folder ID
    await FileModel.updateMany(
      { _id: { $in: [highlightedFileId, maskedFileId] } },
      { folderId: folderId || null }
    );

    // If there's an original file, update it too
    if (highlightedFile.originalFileId) {
      await FileModel.updateMany(
        { _id: highlightedFile.originalFileId },
        { folderId: folderId || null }
      );
    }

    // Now update the user's processedFiles array
    // First, check if the files are already in the array to avoid duplicates
    const user = await UserModel.findById(req.user._id);
    const fileAlreadyExists = user.processedFiles.some(file => 
      file.highlightedVersion && file.highlightedVersion.toString() === highlightedFileId
    );

    if (!fileAlreadyExists) {
      // Add the files to the user's processedFiles
      await UserModel.findByIdAndUpdate(req.user._id, {
        $push: {
          processedFiles: {
            originalName: highlightedFile.originalName,
            highlightedVersion: highlightedFileId,
            maskedVersion: maskedFileId,
            processedAt: new Date(),
            fileType: highlightedFile.fileType,
            folderId: folderId || null
          }
        }
      });
    } else {
      // Update existing file's folder
      await UserModel.updateOne(
        { 
          _id: req.user._id,
          "processedFiles.highlightedVersion": highlightedFileId
        },
        {
          $set: { "processedFiles.$.folderId": folderId || null }
        }
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error saving processed files:", error);
    res.status(500).json({ error: "Error saving files" });
  }
};

// Export processText for testing
exports.processText = processText;
