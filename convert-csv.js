const fs = require("fs").promises; // Use the promise-based version of fs
const jsonexport = require("jsonexport")

async function jsonToCsv(jsonFileName) {
  // Read the JSON file
  try {
    const data = await fs.readFile(jsonFileName, "utf-8");
    // Parse the JSON data
    const products = JSON.parse(data);

    //console.log("DEBUG: Sample JSON Data:", JSON.stringify(products.slice(0, 5), null, 2));
    //console.log("DEBUG: Sample Additional Info:", products.slice(0, 3).map(p => p.additional_info));

    const csvFileName = `${jsonFileName.split(".json")[0]}.csv`;

    // Ensure additional_info remains a single string column before converting to CSV
    // products.forEach(product => {
    //   if (typeof product.additional_info === "object") {
    //     product.additional_info = JSON.stringify(product.additional_info); // Ensure it's a single string
    //   }
      
    //   // 🔹 Ensure additional_info is enclosed in double quotes before converting to CSV
    //   if (typeof product.additional_info === "string") {
    //     product.additional_info = `"${product.additional_info.replace(/"/g, '""')}"`; // Escape double quotes
    //   }
    // });

    // Save a CSV chunk
    const saveCsvChunk = async (chunk, index) => {
      const options = { fillGaps: true };

      try {
        const csv = await new Promise((resolve, reject) => {
          jsonexport(chunk, options, (err, csv) => {
            if (err) {
              reject(err);
            } else {
              resolve(csv);
            }
          });
        });

        // Define the part file name
        const partFileName = `${csvFileName.split(".csv")[0]}_part${index}.csv`;

        // UTF-8 BOM to ensure correct encoding
        const BOM = '\ufeff';
        const csvContent = BOM + csv;

        // Write CSV file with UTF-8 encoding
        await fs.writeFile(partFileName, csvContent, { encoding: 'utf8' });
        console.log(`Successfully saved as ${partFileName}`);

      } catch (err) {
        console.error("Error processing the CSV file:", err);
      }
    };

    // Define the size of each chunk (e.g., 5000 records per file)
    const chunkSize = 5000;
    for (let i = 0; i < products.length; i += chunkSize) {
      const chunk = products.slice(i, i + chunkSize);
      await saveCsvChunk(chunk, i / chunkSize + 1); // Adding await here to ensure proper sequence
    }

  } catch (err) {
    console.error("Error reading the JSON file:", err);
  }
}

module.exports = jsonToCsv
