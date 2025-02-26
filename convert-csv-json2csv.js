const fs = require("fs").promises;
const { Parser } = require("json2csv");

async function jsonToCsv(jsonFileName) {
  try {
    // Read and parse the JSON file
    const data = await fs.readFile(jsonFileName, "utf-8");
    const products = JSON.parse(data);

    // Ensure additional_info remains a single string
    products.forEach(product => {
      if (typeof product.additional_info === "object") {
        product.additional_info = JSON.stringify(product.additional_info);
      }
      if (typeof product.additional_info === "string") {
        product.additional_info = product.additional_info.replace(/"/g, '""'); // Escape quotes
        product.additional_info = `${product.additional_info}`; // Ensure it's enclosed properly
      }
    });

    // 🔹 Automatically extract unique column headers from all products
    const allKeys = new Set();
    products.forEach(product => {
      Object.keys(product).forEach(key => allKeys.add(key));
    });

    // Convert set to array (maintaining order of first appearance)
    const fields = Array.from(allKeys);

    // Convert JSON to CSV
    const parser = new Parser({ fields });
    const csv = parser.parse(products);

    // UTF-8 BOM to ensure correct encoding
    const BOM = '\ufeff';
    const csvContent = BOM + csv;

    // Define CSV file name
    const csvFileName = `${jsonFileName.split(".json")[0]}.csv`;

    // Write CSV file with UTF-8 encoding
    await fs.writeFile(csvFileName, csvContent, { encoding: 'utf8' });

    console.log(`Successfully saved as ${csvFileName}`);
  } catch (err) {
    console.error("Error processing the CSV file:", err);
  }
}

module.exports = jsonToCsv;
