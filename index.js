const path = require('path')
const jsonChecker = require("./json-checker.js")
const jsonFormater = require("./json-formater.js")
const createNewJsonAndCsv = require("./format-json-to-csv.js")

const inputFileName = 'product-drivers-receivers-transceivers-0420'
const outputFileName = 'product-drivers-receivers-transceivers-02232025'

// Construct the file path relative to the current working directory
const inputDir = path.join(__dirname, 'reference-files')
const outputDir = path.join(__dirname, 'generated-files')
const inputJson = path.join(inputDir, `${inputFileName}.json`)
const outputJson = path.join(outputDir, `${outputFileName}.json`)

!jsonChecker(inputJson) ? jsonFormater(inputJson) : ''

createNewJsonAndCsv( inputJson, outputJson )
