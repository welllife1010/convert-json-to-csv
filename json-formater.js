const fs = require('fs');

function jsonFormater(inputFile) {

  const outputFile = `${inputFile.split('.')[0]}_formatted.json`;

  fs.readFile(inputFile, 'utf8', (err, data) => {
    if (err) throw err;
    const formattedJson = JSON.stringify(JSON.parse(data), null, 2);
    fs.writeFile(outputFile, formattedJson, (err) => {
      if (err) throw err;
      console.log('JSON formatted and saved to', outputFile);
    });
  });  
}

module.exports = jsonFormater;