// store.js

// Define default patterns directly in code
const defaultPatterns = [
  {
    name: "PAN",
    pattern: "[A-Z]{5}[0-9]{4}[A-Z]",
    requiresValidation: true
  },
  {
    name: "Aadhaar",
    pattern: "(?:\\d{4}\\s?){2}\\d{4}|\\d{12}",
    requiresValidation: true
  },
  {
    name: "IndianPassport",
    pattern: "[A-Z]\\d{7}",
    requiresValidation: true
  },
  {
    name: "Email",
    pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
    requiresValidation: false
  },
  {
    name: "PhoneNumber",
    pattern: "(?:\\+\\d{1,3}\\s?)?\\d{10}",
    requiresValidation: true
  },
  {
    name: "CreditCard",
    pattern: "(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})",
    requiresValidation: true
  },
  {
    name: "IPv4",
    pattern: "(?:\\d{1,3}\\.){3}\\d{1,3}",
    requiresValidation: true
  },
  {
    name: "IPv6",
    pattern: "(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}",
    requiresValidation: true
  },
  {
    name: "MACAddress",
    pattern: "(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}",
    requiresValidation: true
  },
  {
    name: "SSN",
    pattern: "\\d{3}-\\d{2}-\\d{4}",
    requiresValidation: true
  },
  {
    name: "URL",
    pattern: "https?:\\/\\/[a-zA-Z0-9.-]+(?:\\.[a-zA-Z]{2,})+(?:[\\/\\?#][^\\s]*)?",
    requiresValidation: false
  },
  {
    name: "Date",
    pattern: "(?:\\d{1,2}[-/]\\d{1,2}[-/]\\d{2,4}|\\d{4}[-/]\\d{1,2}[-/]\\d{1,2})",
    requiresValidation: true
  }
];

console.log('[store] Initialized with default patterns:', defaultPatterns.length);

// Initialize store with separate arrays for default and custom patterns
const store = {
  defaultPatterns: [...defaultPatterns],
  customPatterns: [],

  addPattern: function(pattern) {
    console.log('[store] Adding custom pattern:', JSON.stringify(pattern, null, 2));
    // Ensure isCustom flag is set
    pattern.isCustom = true;
    this.customPatterns.push(pattern);
    console.log('[store] Custom pattern added. Total custom patterns:', this.customPatterns.length);
  },

  deletePattern: function(index) {
    console.log('[store] Attempting to delete pattern at index:', index);
    if (index >= 0 && index < this.customPatterns.length) {
      const deleted = this.customPatterns.splice(index, 1);
      console.log('[store] Pattern deleted:', JSON.stringify(deleted[0], null, 2));
      console.log('[store] Remaining custom patterns:', this.customPatterns.length);
    } else {
      console.error('[store] Delete failed: Invalid index', index, 'for array of length', this.customPatterns.length);
      throw new Error("Pattern not found");
    }
  },

  getCustomPatterns: function() {
    console.log('[store] Getting custom patterns. Count:', this.customPatterns.length);
    return this.customPatterns;
  },

  getDefaultPatterns: function() {
    console.log('[store] Getting default patterns. Count:', this.defaultPatterns.length);
    return this.defaultPatterns;
  },

  // For scanning, we use both default and custom patterns
  getAllPatterns: function() {
    const allPatterns = [...this.defaultPatterns, ...this.customPatterns];
    console.log('[store] Getting all patterns. Total:', allPatterns.length, 
                '(Default:', this.defaultPatterns.length, 
                'Custom:', this.customPatterns.length, ')');
    return allPatterns;
  }
};

module.exports = store;