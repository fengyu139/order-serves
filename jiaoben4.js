const fs = require('fs');
const path = require('path');

// Function to read and update files in a directory, including subdirectories
function updateFilesInDirectory(directoryPath, searchString, replaceString, exclusions = [], extensions = []) {
    // Read all items in the directory
    fs.readdir(directoryPath, (err, items) => {
        if (err) {
            return console.error('Unable to scan directory:', err);
        }

        // Iterate over each item in the directory
        items.forEach((item) => {
            const itemPath = path.join(directoryPath, item);

            // Check if the item should be excluded
            if (exclusions.includes(item)) {
                console.log(`Excluding: ${itemPath}`);
                return;
            }

            // Check if the item is a directory or a file
            fs.stat(itemPath, (err, stats) => {
                if (err) {
                    return console.error('Unable to stat item:', err);
                }

                if (stats.isDirectory()) {
                    // Recursively update files in the subdirectory
                    updateFilesInDirectory(itemPath, searchString, replaceString, exclusions, extensions);
                } else if (stats.isFile()) {
                    // Check if the file has the desired extension
                    const fileExtension = path.extname(item).toLowerCase();
                    if (!extensions.length || extensions.includes(fileExtension)) {
                        // Read the content of the file
                        fs.readFile(itemPath, 'utf8', (err, data) => {
                            if (err) {
                                return console.error('Unable to read file:', err);
                            }

                            // Replace the specified string with the new string
                            if(data.indexOf(searchString) > -1){
                                const updatedContent = data.replace(new RegExp(searchString, 'g'), replaceString);

                                // Write the updated content back to the file
                                fs.writeFile(itemPath, updatedContent, 'utf8', (err) => {
                                    if (err) {
                                        return console.error('Unable to write to file:', err);
                                    }
                                    console.log(`File updated: ${itemPath}`);
                                });
                            }
                          
                        });
                    }
                }
            });
        });
    });
}

const extensions = ['.js', '.ts', '.html']; // Extensions to include
// Example usage
const directoryPath = '/Users/test/Documents/luodiye/saas_html/oss-resource/soss/saasApp/ossImages/'; // Replace with your directory path
const searchString = '/saas-player-register/front/platPromoteFreeGame/get'; // Replace with the string you want to replace
const replaceString = '/saas-pro-client-dashboard-openapi/cash/h5/plat-promote-free-game/get'; // Replace with the new string
const exclusions = ['node_modules', 'jiaoben4.js']; // Replace with the items you want to exclude
updateFilesInDirectory(directoryPath, searchString, replaceString, exclusions,extensions);
