const fs = require('fs');
const xml2js = require('xml2js');

const readXMLFile = (filePath) => {
    return new Promise((resolve, reject) => {
        // Read the XML file
        fs.readFile(filePath, (err, data) => {
            if (err) {
                return reject('Error reading the file: ' + err);
            }

            // Parse the XML data
            xml2js.parseString(data, (err, result) => {
                if (err) {
                    return reject('Error parsing XML: ' + err);
                }
                resolve(result);
            });
        });
    });
};

module.exports = { readXMLFile };