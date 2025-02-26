const fs = require("fs");
//const jsonToCsv = require("./convert-csv.js");
const jsonToCsv = require("./convert-csv-json2csv.js");

async function createNewJsonAndCsv( inputJsonFile, outputJsonFileName ) {

  function extractCategoryPath(category) {
    let path = category.Name; // Start with the current category name
    let currentCategory = category;

    // Traverse child categories to build the path
    while (
      currentCategory.ChildCategories &&
      currentCategory.ChildCategories.length > 0
    ) {
      currentCategory = currentCategory.ChildCategories[0]; // Navigate to the first child
      path += `>${currentCategory.Name}`; // Append the child category name
    }

    return path;
  }

  function processProductVariations(productVariations) {
    if (!Array.isArray(productVariations)) {
      console.warn("Warning: productVariations is not an array. Defaulting to empty array.");
      return {}; // Return an empty object to prevent errors
    }

    // Initialize an object to hold the flattened data
    const flattened = {};
  
    productVariations.forEach((variation, firstIndex) => {
      const variationIndex = firstIndex + 1; // 1-based index
      const baseKey = `ProductVariations_DigiKeyProductNumber_${variationIndex}`;
  
      // Flatten variation-level fields
      flattened[baseKey] = variation.DigiKeyProductNumber;
      flattened[`${baseKey}_PackageType`] = variation.PackageType?.Name || null;
      flattened[`${baseKey}_QuantityAvailableforPackageType`] = variation.QuantityAvailableforPackageType || null;
      flattened[`${baseKey}_MaxQuantityForDistribution`] = variation.MaxQuantityForDistribution || null;
      flattened[`${baseKey}_MinimumOrderQuantity`] = variation.MinimumOrderQuantity || null;
      flattened[`${baseKey}_StandardPackage`] = variation.StandardPackage || null;
      flattened[`${baseKey}_TariffActive`] = variation.TariffActive || false;
      flattened[`${baseKey}_DigiReelFee`] = variation.DigiReelFee || 0;
  
      // Flatten pricing details
      variation.StandardPricing.forEach((pricing, secondIndex) => {
        const pricingIndex = secondIndex + 1; // 1-based index
        flattened[`${baseKey}_StandardPricing_BreakQuantity_${pricingIndex}`] =
          pricing.BreakQuantity;
        flattened[`${baseKey}_StandardPricing_UnitPrice_${pricingIndex}`] =
          pricing.UnitPrice;
        flattened[`${baseKey}_StandardPricing_TotalPrice_${pricingIndex}`] =
          pricing.TotalPrice;
      });
    });
  
    return flattened;
  }
  
  // Read the JSON file and parse it
  const rawData = await fs.promises.readFile(inputJsonFile, 'utf8');
  const jsonData = JSON.parse(rawData); // Convert JSON string to object

  if (!Array.isArray(jsonData)) {
    throw new Error("Parsed JSON data is not an array. Check the input file structure.");
  }

  const newData = jsonData.flatMap((item) => {

    // 1 - Extract base data
    const baseData = {
      Part_Title: `${item.ManufacturerProductNumber} | ${item.Manufacturer.Name} | ${item.Category.Name}`,
      Part_Number: item.ManufacturerProductNumber,
      Category: extractCategoryPath(item.Category),
      Series: item.Series.Name,
      Manufacturer: item.Manufacturer.Name,
      Product_Status: item.ProductStatus.Status,
      Short_Description: item.Description.ProductDescription,
      Part_Description: item.Description.DetailedDescription,
      Leadtime: item.ManufacturerLeadWeeks,
      Datasheet: item.DatasheetUrl,
      Quantity_Available: item.QuantityAvailable,
      Image_URL: item.PhotoUrl,
      ReachStatus: item.Classifications.ReachStatus,
      RohsStatus: item.Classifications.RohsStatus,
      MoistureSensitivityLevel: item.MoistureSensitivityLevel,
      ExportControlClassNumber: item.ExportControlClassNumber,
      HtsusCode: item.HtsusCode,
      //UnitPrice_Main: item.UnitPrice,
    };

    // 2 - Extract parameters into separate columns
    const filteredParameters = item.Parameters.filter(param => 
      !param.ParameterText.toLowerCase().includes("digikey")
    );

    // 2a - Add each parameter to the baseData object
    filteredParameters.forEach((param) => {
      baseData[`${param.ParameterText}`] = param.ValueText;
    });


    // 2b - Add additional info column
    const additionalInfo = {
      additional_info: filteredParameters
        .map((param, index) => 
          `<strong>${param.ParameterText.trim()}: </strong> ${param.ValueText.trim()}${index === filteredParameters.length - 1 ? "" : "<br>"}`
        )
        .join("")
    };

    // 3 - Extract Classifications fields
    const classifications = item.Classifications
      ? {
          ReachStatus: item.Classifications.ReachStatus || "N/A",
          RohsStatus: item.Classifications.RohsStatus || "N/A",
          MoistureSensitivityLevel:
            item.Classifications.MoistureSensitivityLevel || "N/A",
          ExportControlClassNumber:
            item.Classifications.ExportControlClassNumber || "N/A",
          HtsusCode: item.Classifications.HtsusCode || "N/A",
        }
      : {
          ReachStatus: "N/A",
          RohsStatus: "N/A",
          MoistureSensitivityLevel: "N/A",
          ExportControlClassNumber: "N/A",
          HtsusCode: "N/A",
        };

    // 4 - Flatten product variations
    //const flattenedVariations = processProductVariations(item.ProductVariations);

    // Combine base data, additional info, and/or flattened variations
    return {
      ...baseData,
      ...additionalInfo,
      ...classifications,
      //...flattenedVariations,
    };

  });

  try {
    // Write the results to a JSON file
    await fs.promises.writeFile(outputJsonFileName,JSON.stringify(newData, null, 2));
    console.log("JSON file written successfully.");

    // Convert to CSV and write to file
    await jsonToCsv(outputJsonFileName);

    console.log(newData.length, "records processed.");
    console.log("Files generated successfully!");
  } catch (error) {
    console.error("Error occurred:", error);
  }
}

module.exports = createNewJsonAndCsv;