const fs = require('fs')
const path = require('path')
const jsonChecker = require("./json-checker.js")
const jsonFormater = require("./json-formater.js")
const createNewJsonAndCsv = require("./format-json-to-csv.js")

const inputFileName = 'product-rf-switches-0421'
const outputFileName = 'product-rf-switches-02252025'

// Construct the file path relative to the current working directory
const inputDir = path.join(__dirname, 'reference-files')
const outputDir = path.join(__dirname, 'generated-files')
const inputJson = path.join(inputDir, `${inputFileName}.json`)
const outputJson = path.join(outputDir, `${outputFileName}.json`)

// Create directory if it doesn't exist
function ensureDirectoryExistence(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// Ensure the directories exist
ensureDirectoryExistence(inputDir);
ensureDirectoryExistence(outputDir);

!jsonChecker(inputJson) ? jsonFormater(inputJson) : ''

createNewJsonAndCsv( inputJson, outputJson )
