const fs = require('fs');
const path = require('path');
const jsonlint = require('jsonlint');

function jsonChecker(inputFilePath) {
  try {
    // Read the file
    const data = fs.readFileSync(inputFilePath, 'utf-8');
    
    // Validate the JSON
    jsonlint.parse(data);
    console.log('JSON is valid');

    return true;
  } catch (err) {
    console.error('JSON linting error:', err.message);
    return false;
  }
}

module.exports = jsonChecker;

